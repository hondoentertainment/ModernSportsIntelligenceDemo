// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  AlertTriangle,
  DollarSign,
  Shield,
  TrendingDown,
  Award,
  ShieldCheck,
  AlertCircle,
  Layers,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import {
  getAppraisalReport,
  getCardAppraisals,
  getValueDistribution,
  getDepreciationRates,
  getInsuranceCoverage,
  getRiskFactors,
  getAppraisalCertificates,
  getSummaryStats,
  formatCurrency,
  formatDate,
  getConditionLabel,
  type AppraisalReport,
  type CardAppraisal,
  type ValueDistribution,
  type DepreciationRate,
  type InsuranceCoverage,
  type RiskFactor,
  type AppraisalCertificate,
  type AppraiserSummary,
} from '../lib/core/collectionAppraiserService';
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
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  vintage: '#f59e0b',
  modern: '#3b82f6',
  rookies: '#22c55e',
  graded: '#a855f7',
  autographs: '#ef4444',
  memorabilia: '#06b6d4',
  inserts: '#ec4899',
};

const CollectionAppraiser: React.FC = () => {
  const [report, setReport] = useState<AppraisalReport | null>(null);
  const [appraisals, setAppraisals] = useState<CardAppraisal[]>([]);
  const [distribution, setDistribution] = useState<ValueDistribution[]>([]);
  const [depreciation, setDepreciation] = useState<DepreciationRate[]>([]);
  const [insurance, setInsurance] = useState<InsuranceCoverage[]>([]);
  const [risks, setRisks] = useState<RiskFactor[]>([]);
  const [certificates, setCertificates] = useState<AppraisalCertificate[]>([]);
  const [summary, setSummary] = useState<AppraiserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setReport(getAppraisalReport());
      setAppraisals(getCardAppraisals());
      setDistribution(getValueDistribution());
      setDepreciation(getDepreciationRates());
      setInsurance(getInsuranceCoverage());
      setRisks(getRiskFactors());
      setCertificates(getAppraisalCertificates());
      setSummary(getSummaryStats());
      setLoading(false);
    } catch  {
      setError('Failed to load Collection Appraiser data');
      setLoading(false);
    }
  }, []);

  const totalFairMarket = useMemo(() => appraisals.reduce((s, a) => s + a.fairMarketValue, 0), [appraisals]);
  const totalInsuranceValue = useMemo(() => appraisals.reduce((s, a) => s + a.insuranceValue, 0), [appraisals]);
  const avgDepreciation = useMemo(() => depreciation.length > 0 ? depreciation.reduce((s, d) => s + d.rate, 0) / depreciation.length : 0, [depreciation]);

  const pieData = useMemo(() => {
    return distribution.map(d => ({
      name: d.category,
      value: d.totalValue,
      color: CATEGORY_COLORS[d.category.toLowerCase()] || '#64748b',
    }));
  }, [distribution]);

  const depreciationChartData = useMemo(() => {
    return depreciation.map(d => ({
      category: d.category.length > 15 ? d.category.slice(0, 15) + '...' : d.category,
      rate: d.rate,
      projected: d.projectedLoss,
    }));
  }, [depreciation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Collection Appraiser...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <FileCheck size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AI Collection Appraiser &amp; Insurance Valuation</h1>
            <p className="text-sm text-slate-400">Fair market and insurance valuations with AI-powered risk assessment &mdash; Phase 150</p>
          </div>
        </div>
        {report && (
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
            Report #{report.reportId}
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Appraised</p>
          <p className="text-2xl font-bold text-white">{summary?.totalCards ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">In collection</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fair Market Value</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalFairMarket)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Insurance Value</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalInsuranceValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value Gap</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalInsuranceValue - totalFairMarket)}</p>
          <p className="text-xs text-slate-600 mt-1">Insurance premium</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Depreciation</p>
          <p className="text-2xl font-bold text-red-400">{avgDepreciation.toFixed(1)}%</p>
          <p className="text-xs text-slate-600 mt-1">Annual rate</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Score</p>
          <p className="text-2xl font-bold text-violet-400">{summary?.overallRiskScore ?? 0}/100</p>
        </div>
      </div>

      {/* Appraisal Report Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-emerald-400" />
              <p className="text-sm font-bold text-slate-200">Market Valuation</p>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-2">{formatCurrency(report.totalMarketValue)}</p>
            <p className="text-xs text-slate-400">Based on recent comps and market trends</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-[10px] text-slate-500">High Estimate</p>
                <p className="text-xs font-bold text-emerald-400">{formatCurrency(report.highEstimate)}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-[10px] text-slate-500">Low Estimate</p>
                <p className="text-xs font-bold text-amber-400">{formatCurrency(report.lowEstimate)}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-blue-400" />
              <p className="text-sm font-bold text-slate-200">Insurance Recommendation</p>
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-2">{formatCurrency(report.recommendedCoverage)}</p>
            <p className="text-xs text-slate-400">Recommended coverage amount</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-[10px] text-slate-500">Annual Premium</p>
                <p className="text-xs font-bold text-blue-400">{formatCurrency(report.annualPremium)}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-[10px] text-slate-500">Deductible</p>
                <p className="text-xs font-bold text-slate-300">{formatCurrency(report.deductible)}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-violet-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale size={16} className="text-violet-400" />
              <p className="text-sm font-bold text-slate-200">Appraisal Confidence</p>
            </div>
            <p className="text-3xl font-bold text-violet-400 mb-2">{report.confidenceScore}%</p>
            <p className="text-xs text-slate-400">Based on data quality and market activity</p>
            <div className="w-full h-3 bg-slate-700 rounded-full mt-3">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: `${report.confidenceScore}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Last updated: {formatDate(report.lastUpdated)}</p>
          </div>
        </div>
      )}

      {/* PieChart Value Distribution + BarChart Depreciation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Layers size={18} className="text-amber-400" />
            Value Distribution by Category
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-400" />
            Depreciation Rates by Category
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depreciationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="rate" fill="#ef4444" name="Annual Rate %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projected" fill="#f59e0b" name="Projected Loss $" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Annual Rate</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> Projected Loss</span>
          </div>
        </div>
      </div>

      {/* Card Appraisals Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <FileCheck size={18} className="text-emerald-400" />
          Card Appraisals &mdash; Fair Market vs Insurance Values
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Card</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Year</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Condition</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Fair Market</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Insurance Value</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Replacement Cost</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Grade</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Category</th>
              </tr>
            </thead>
            <tbody>
              {appraisals.map(card => (
                <tr key={card.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium">{card.name}</td>
                  <td className="py-2 px-3 text-slate-400">{card.year}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${card.condition === 'mint' ? 'bg-emerald-500/20 text-emerald-400' : card.condition === 'near_mint' ? 'bg-blue-500/20 text-blue-400' : card.condition === 'excellent' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {getConditionLabel(card.condition)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(card.fairMarketValue)}</td>
                  <td className="py-2 px-3 text-right text-blue-400 font-bold">{formatCurrency(card.insuranceValue)}</td>
                  <td className="py-2 px-3 text-right text-amber-400">{formatCurrency(card.replacementCost)}</td>
                  <td className="py-2 px-3 text-slate-300">{card.grade}</td>
                  <td className="py-2 px-3 text-slate-400">{card.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Coverage + Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurance Coverage Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-blue-400" />
            Insurance Coverage Comparison
          </h2>
          <div className="space-y-3">
            {insurance.map(plan => (
              <div key={plan.id} className={`bg-slate-900/50 border rounded-xl p-4 ${plan.recommended ? 'border-emerald-500/30' : 'border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{plan.provider}</p>
                    {plan.recommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Recommended</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(plan.annualPremium)}<span className="text-[10px] text-slate-500">/yr</span></p>
                </div>
                <p className="text-xs text-slate-400 mb-2">{plan.planName}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-[10px] text-slate-500">Coverage</p>
                    <p className="text-xs font-bold text-white">{formatCurrency(plan.coverageAmount)}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-[10px] text-slate-500">Deductible</p>
                    <p className="text-xs font-bold text-white">{formatCurrency(plan.deductible)}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                    <p className="text-[10px] text-slate-500">Rating</p>
                    <p className="text-xs font-bold text-amber-400">{plan.rating}/5</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {plan.features.map((feature, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factor Assessment */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-400" />
            Risk Factor Assessment
          </h2>
          <div className="space-y-3">
            {risks.map(risk => (
              <div key={risk.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{risk.name}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${risk.severity === 'high' ? 'bg-red-500/20 text-red-400' : risk.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Impact Score:</span>
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${risk.impactScore >= 80 ? 'bg-red-500' : risk.impactScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${risk.impactScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">{risk.impactScore}/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Likelihood: {risk.likelihood}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Mitigation: <span className="text-slate-400">{risk.mitigation}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appraisal Certificates */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Award size={18} className="text-amber-400" />
          Appraisal Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Certificate #{cert.certificateNumber}
                </span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white mb-1">{cert.cardName}</p>
              <p className="text-[10px] text-slate-500 mb-3">{cert.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Fair Market</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(cert.fairMarketValue)}</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Insurance</p>
                  <p className="text-sm font-bold text-blue-400">{formatCurrency(cert.insuranceValue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Appraised: {formatDate(cert.appraisalDate)}</span>
                <span>Valid until: {formatDate(cert.validUntil)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <ShieldCheck size={10} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Verified by {cert.appraiser}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionAppraiser;
