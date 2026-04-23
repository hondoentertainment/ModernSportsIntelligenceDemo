// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, AlertTriangle, BarChart3, Plus, Download, Eye, Clock,
  CheckCircle, XCircle, ChevronRight, DollarSign, RefreshCw, AlertCircle,
  FileCheck, Upload, Calendar, TrendingUp, Award, Building2, Layers,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  getAppraisalHistory,
  getInsurancePolicies,
  getClaims,
  getCoverageRecommendations,
  getCollectionValuationSummary,
  estimatePremium,
  generateAppraisalReport,
  fileClaim,
  createPolicy,
  type AppraisalReport,
  type AppraisalLineItem,
  type InsurancePolicy,
  type InsuranceClaim,
  type CoverageRecommendation,
  type CollectionValuationSummary,
  type PremiumEstimate,
  type CoverageLevel,
  type ClaimStatus,
  type PolicyStatus,
  type ClaimDocument,
} from '../lib/core/insuranceAppraisalService';

const TABS = ['Appraisals', 'Policies', 'Claims', 'Coverage Analyzer'] as const;
type Tab = (typeof TABS)[number];

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399'];

const fmt = (n: number) => `$${n.toLocaleString()}`;

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  suspended: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  filed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  denied: 'bg-red-500/20 text-red-400 border-red-500/30',
  settled: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  finalized: 'bg-green-500/20 text-green-400 border-green-500/30',
  draft: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const Badge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-slate-600 text-slate-300'}`}>
    {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
  </span>
);

const priorityColors: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-amber-500 bg-amber-500/5',
  medium: 'border-l-blue-500 bg-blue-500/5',
  low: 'border-l-slate-500 bg-slate-500/5',
};

// ─── Appraisals Tab ──────────────────────────────────────────────────────────

const AppraisalsTab: React.FC<{
  reports: AppraisalReport[];
  onGenerate: () => void;
}> = ({ reports, onGenerate }) => {
  const [selectedReport, setSelectedReport] = useState<AppraisalReport | null>(null);
  const [selectedItem, setSelectedItem] = useState<AppraisalLineItem | null>(null);

  if (selectedItem) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedItem(null)} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          &larr; Back to Report
        </button>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{selectedItem.cardName}</h3>
              <p className="text-sm text-slate-400">{selectedItem.year} {selectedItem.manufacturer} | {selectedItem.grade} ({selectedItem.grader}) | Cert #{selectedItem.certNumber}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/30 flex items-center gap-1">
                <Award size={12} /> Insurance-Grade
              </span>
              <span className="px-2 py-1 rounded bg-blue-500/15 text-blue-400 text-xs font-medium border border-blue-500/30 flex items-center gap-1">
                <FileCheck size={12} /> IRS-Compliant
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Fair Market Value</p>
              <p className="text-2xl font-bold text-green-400">{fmt(selectedItem.fairMarketValue)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Replacement Value</p>
              <p className="text-2xl font-bold text-blue-400">{fmt(selectedItem.replacementValue)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Liquidation Value</p>
              <p className="text-2xl font-bold text-amber-400">{fmt(selectedItem.liquidationValue)}</p>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Comparable Sales Evidence ({selectedItem.comparables.length} comps)</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {selectedItem.comparables.map(comp => (
              <div key={comp.id} className="bg-slate-900 rounded border border-slate-700 p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{comp.description}</p>
                  <p className="text-xs text-slate-500">{comp.venue} | {comp.saleDate} | {comp.grade}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-sm font-semibold text-green-400">{fmt(comp.salePrice)}</p>
                  <p className="text-xs text-slate-500">Relevance: {Math.round(comp.relevanceScore * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
          {selectedItem.notes && (
            <p className="mt-4 text-sm text-slate-400 italic">{selectedItem.notes}</p>
          )}
        </div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedReport(null)} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          &larr; Back to History
        </button>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{selectedReport.title}</h3>
              <p className="text-sm text-slate-400">Created {new Date(selectedReport.createdAt).toLocaleDateString()} | Purpose: {selectedReport.purpose}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge status={selectedReport.status} />
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded flex items-center gap-1">
                <Download size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Certification */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-amber-400" />
              <h4 className="text-sm font-semibold text-slate-200">Certification</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Appraiser</p>
                <p className="text-slate-200">{selectedReport.certification.appraiserName}</p>
              </div>
              <div>
                <p className="text-slate-500">Credentials</p>
                <p className="text-slate-200">{selectedReport.certification.appraiserCredentials}</p>
              </div>
              <div>
                <p className="text-slate-500">Valid Until</p>
                <p className="text-slate-200">{selectedReport.certification.expirationDate}</p>
              </div>
              <div className="flex gap-2 items-end">
                {selectedReport.certification.irsCompliant && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs border border-blue-500/30">IRS</span>
                )}
                {selectedReport.certification.insuranceGrade && (
                  <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-xs border border-green-500/30">INS</span>
                )}
                {selectedReport.certification.uspap && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 text-xs border border-purple-500/30">USPAP</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
              <p className="text-xs text-slate-500 uppercase">Total FMV</p>
              <p className="text-xl font-bold text-green-400">{fmt(selectedReport.totalFairMarketValue)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
              <p className="text-xs text-slate-500 uppercase">Replacement</p>
              <p className="text-xl font-bold text-blue-400">{fmt(selectedReport.totalReplacementValue)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
              <p className="text-xs text-slate-500 uppercase">Liquidation</p>
              <p className="text-xl font-bold text-amber-400">{fmt(selectedReport.totalLiquidationValue)}</p>
            </div>
          </div>

          {/* Line Items */}
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Appraised Items ({selectedReport.lineItems.length})</h4>
          <div className="space-y-2">
            {selectedReport.lineItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="w-full bg-slate-900 rounded border border-slate-700 p-3 flex items-center justify-between hover:border-blue-500/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{item.cardName}</p>
                  <p className="text-xs text-slate-500">{item.grade} ({item.grader}) | {item.comparables.length} comps</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold text-green-400">{fmt(item.fairMarketValue)}</span>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Appraisal History</h3>
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Generate Appraisal
        </button>
      </div>
      {reports.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p>No appraisals yet. Generate your first appraisal report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="w-full bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500/50 transition-colors text-left"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-blue-400 shrink-0" />
                    <p className="text-sm font-semibold text-slate-200 truncate">{report.title}</p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()} | {report.lineItems.length} items | Purpose: {report.purpose}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge status={report.status} />
                  <span className="text-sm font-bold text-green-400">{fmt(report.totalFairMarketValue)}</span>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Policies Tab ────────────────────────────────────────────────────────────

const PoliciesTab: React.FC<{
  policies: InsurancePolicy[];
  onCreatePolicy: () => void;
}> = ({ policies, onCreatePolicy }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const estimates: PremiumEstimate[] = (['basic', 'standard', 'premium', 'institutional'] as CoverageLevel[]).map(
    level => estimatePremium(500000, level)
  );

  if (showComparison) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowComparison(false)} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          &larr; Back to Policies
        </button>
        <h3 className="text-lg font-semibold text-slate-100">Provider & Coverage Comparison</h3>
        <p className="text-sm text-slate-400">Estimated rates for $500,000 coverage</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Feature</th>
                {estimates.map(e => (
                  <th key={e.level} className="text-center py-3 px-3 text-slate-300 font-semibold capitalize">{e.level}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr>
                <td className="py-2 px-3 text-slate-400">Annual Premium</td>
                {estimates.map(e => (
                  <td key={e.level} className="py-2 px-3 text-center text-slate-200 font-medium">{fmt(e.annualPremium)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400">Monthly</td>
                {estimates.map(e => (
                  <td key={e.level} className="py-2 px-3 text-center text-slate-200">{fmt(e.monthlyPremium)}/mo</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400">Deductible</td>
                {estimates.map(e => (
                  <td key={e.level} className="py-2 px-3 text-center text-slate-200">{fmt(e.deductible)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-400">Rate / $1,000</td>
                {estimates.map(e => (
                  <td key={e.level} className="py-2 px-3 text-center text-slate-200">${e.ratePerThousand.toFixed(2)}</td>
                ))}
              </tr>
              {['All-risk coverage', 'Transit coverage', 'Show/exhibit coverage', 'Mysterious disappearance', 'Dedicated claims adjuster'].map(feat => (
                <tr key={feat}>
                  <td className="py-2 px-3 text-slate-400">{feat}</td>
                  {estimates.map(e => (
                    <td key={e.level} className="py-2 px-3 text-center">
                      {e.features.some(f => f.toLowerCase().includes(feat.toLowerCase().split(' ')[0]))
                        ? <CheckCircle size={16} className="text-green-400 mx-auto" />
                        : <XCircle size={16} className="text-slate-600 mx-auto" />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (selectedPolicy) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedPolicy(null)} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          &larr; Back to Policies
        </button>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={18} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-100">{selectedPolicy.providerName}</h3>
              </div>
              <p className="text-sm text-slate-400">Policy #{selectedPolicy.policyNumber}</p>
            </div>
            <Badge status={selectedPolicy.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Coverage</p>
              <p className="text-lg font-bold text-green-400">{fmt(selectedPolicy.coverageAmount)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Annual Premium</p>
              <p className="text-lg font-bold text-blue-400">{fmt(selectedPolicy.annualPremium)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Deductible</p>
              <p className="text-lg font-bold text-slate-200">{fmt(selectedPolicy.deductible)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase">Renewal</p>
              <p className="text-lg font-bold text-amber-400">{selectedPolicy.renewalDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Coverage Details</h4>
              <ul className="space-y-1">
                {selectedPolicy.coverageDetails.map((d, i) => (
                  <li key={i} className="text-slate-400 flex items-start gap-2">
                    <span className="text-green-500 mt-1">&#8226;</span> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1"><XCircle size={14} className="text-red-400" /> Exclusions</h4>
              <ul className="space-y-1">
                {selectedPolicy.exclusions.map((e, i) => (
                  <li key={i} className="text-slate-400 flex items-start gap-2">
                    <span className="text-red-500 mt-1">&#8226;</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <span>Level: <span className="text-slate-300 capitalize">{selectedPolicy.coverageLevel}</span></span>
            <span>|</span>
            <span>Items Covered: <span className="text-slate-300">{selectedPolicy.coveredItems}</span></span>
            <span>|</span>
            <span>Auto Renew: <span className="text-slate-300">{selectedPolicy.autoRenew ? 'Yes' : 'No'}</span></span>
            <span>|</span>
            <span>Effective: <span className="text-slate-300">{selectedPolicy.effectiveDate}</span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-slate-100">Insurance Policies</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowComparison(true)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Layers size={16} /> Compare Plans
          </button>
          <button
            onClick={onCreatePolicy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Add Policy
          </button>
        </div>
      </div>

      {/* Coverage Gap Alert */}
      {(() => {
        const activePolicies = policies.filter(p => p.status === 'active');
        const totalCoverage = activePolicies.reduce((s, p) => s + p.coverageAmount, 0);
        const portfolioValue = 1125000;
        const gap = portfolioValue - totalCoverage;
        if (gap > 0) {
          return (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Coverage Gap Detected</p>
                <p className="text-sm text-slate-400">
                  Your portfolio ({fmt(portfolioValue)}) exceeds total active coverage ({fmt(totalCoverage)}) by <span className="text-amber-300 font-medium">{fmt(gap)}</span>.
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      <div className="space-y-3">
        {policies.map(policy => (
          <button
            key={policy.id}
            onClick={() => setSelectedPolicy(policy)}
            className="w-full bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500/50 transition-colors text-left"
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={16} className="text-blue-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-200 truncate">{policy.providerName}</p>
                </div>
                <p className="text-xs text-slate-500">
                  #{policy.policyNumber} | {policy.coverageLevel.toUpperCase()} | {policy.coveredItems} items
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">{fmt(policy.coverageAmount)}</p>
                  <p className="text-xs text-slate-500">{fmt(policy.annualPremium)}/yr</p>
                </div>
                <Badge status={policy.status} />
                <ChevronRight size={14} className="text-slate-600" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Claims Tab ──────────────────────────────────────────────────────────────

const ClaimsTab: React.FC<{
  claims: InsuranceClaim[];
  onFileClaim: () => void;
}> = ({ claims, onFileClaim }) => {
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);

  const docStatusIcon = (status: ClaimDocument['status']) => {
    switch (status) {
      case 'verified': return <CheckCircle size={14} className="text-green-400" />;
      case 'uploaded': return <Upload size={14} className="text-blue-400" />;
      case 'rejected': return <XCircle size={14} className="text-red-400" />;
      default: return <AlertCircle size={14} className="text-amber-400" />;
    }
  };

  if (selectedClaim) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedClaim(null)} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
          &larr; Back to Claims
        </button>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Claim #{selectedClaim.claimNumber}</h3>
              <p className="text-sm text-slate-400">Filed {selectedClaim.filedDate} | Incident {selectedClaim.incidentDate}</p>
            </div>
            <Badge status={selectedClaim.status} />
          </div>

          <p className="text-sm text-slate-300 mb-4">{selectedClaim.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500">Claim Amount</p>
              <p className="text-lg font-bold text-blue-400">{fmt(selectedClaim.claimAmount)}</p>
            </div>
            {selectedClaim.settledAmount !== undefined && (
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <p className="text-xs text-slate-500">Settled</p>
                <p className="text-lg font-bold text-green-400">{fmt(selectedClaim.settledAmount)}</p>
              </div>
            )}
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-lg font-bold text-slate-200 capitalize">{selectedClaim.category}</p>
            </div>
            {selectedClaim.adjusterName && (
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <p className="text-xs text-slate-500">Adjuster</p>
                <p className="text-sm font-medium text-slate-200">{selectedClaim.adjusterName}</p>
              </div>
            )}
          </div>

          {/* Affected Items */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Affected Items</h4>
            <div className="flex flex-wrap gap-2">
              {selectedClaim.affectedItems.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">{item}</span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Claim Timeline</h4>
          <div className="relative border-l-2 border-slate-700 ml-3 mb-6 space-y-4">
            {selectedClaim.timeline.map((entry, i) => (
              <div key={i} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${i === selectedClaim.timeline.length - 1 ? 'bg-blue-500 border-blue-400' : 'bg-slate-800 border-slate-600'}`} />
                <p className="text-xs text-slate-500">{entry.date}</p>
                <p className="text-sm font-medium text-slate-200">{entry.event}</p>
                <p className="text-xs text-slate-400">{entry.detail}</p>
              </div>
            ))}
          </div>

          {/* Documents */}
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Required Documents</h4>
          <div className="space-y-2">
            {selectedClaim.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between bg-slate-900 rounded border border-slate-700 p-3">
                <div className="flex items-center gap-2">
                  {docStatusIcon(doc.status)}
                  <span className="text-sm text-slate-300">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={doc.status} />
                  {doc.uploadedAt && <span className="text-xs text-slate-500">{doc.uploadedAt}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Insurance Claims</h3>
        <button
          onClick={onFileClaim}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <AlertTriangle size={16} /> File Claim
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Shield size={48} className="mx-auto mb-3 opacity-40" />
          <p>No claims filed. Hopefully it stays that way.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => (
            <button
              key={claim.id}
              onClick={() => setSelectedClaim(claim)}
              className="w-full bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500/50 transition-colors text-left"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={16} className={
                      claim.status === 'settled' ? 'text-green-400' :
                      claim.status === 'denied' ? 'text-red-400' :
                      'text-amber-400'
                    } />
                    <p className="text-sm font-semibold text-slate-200">#{claim.claimNumber}</p>
                    <Badge status={claim.status} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{claim.description}</p>
                  <p className="text-xs text-slate-500 mt-1">Filed {claim.filedDate} | {claim.category} | {claim.affectedItems.length} item(s)</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">{fmt(claim.claimAmount)}</p>
                    {claim.settledAmount !== undefined && (
                      <p className="text-xs text-green-400">Settled: {fmt(claim.settledAmount)}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Coverage Analyzer Tab ───────────────────────────────────────────────────

const CoverageAnalyzerTab: React.FC<{
  summary: CollectionValuationSummary;
  recommendations: CoverageRecommendation[];
}> = ({ summary, recommendations }) => {
  const premiumBreakdown = [
    { name: 'Premium (CIS)', value: 2375, color: '#10b981' },
    { name: 'Premium (ACI)', value: 225, color: '#60a5fa' },
    { name: 'Rider: Climate', value: 120, color: '#a78bfa' },
    { name: 'Admin Fees', value: 50, color: '#fbbf24' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-xs text-slate-500 uppercase">Portfolio FMV</p>
          <p className="text-xl font-bold text-green-400">{fmt(summary.totalFairMarketValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-xs text-slate-500 uppercase">Total Insured</p>
          <p className="text-xl font-bold text-blue-400">{fmt(summary.totalInsuredValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-xs text-slate-500 uppercase">Coverage Gap</p>
          <p className={`text-xl font-bold ${summary.coverageGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {summary.coverageGap > 0 ? fmt(summary.coverageGap) : 'Fully Covered'}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-xs text-slate-500 uppercase">Coverage Ratio</p>
          <p className={`text-xl font-bold ${summary.coverageRatio >= 1 ? 'text-green-400' : summary.coverageRatio >= 0.85 ? 'text-amber-400' : 'text-red-400'}`}>
            {Math.round(summary.coverageRatio * 100)}%
          </p>
        </div>
      </div>

      {/* Value vs Coverage Chart */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Portfolio Value vs. Insurance Coverage</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.valuationTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [fmt(value), '']}
              />
              <Area type="monotone" dataKey="fmv" name="Fair Market Value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="insured" name="Insured Value" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Premium Breakdown */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Annual Premium Breakdown</h4>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={premiumBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ name, value }: { name: string; value: number }) => `${name}: $${value}`}
                >
                  {premiumBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                  formatter={(value: number) => [fmt(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-500 mt-1">
            Total: {fmt(premiumBreakdown.reduce((s, p) => s + p.value, 0))}/year
          </p>
        </div>

        {/* Under-insured Items */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">High-Value Items Coverage</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary.highValueItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-900 rounded p-2 border border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{item.name}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-xs font-medium text-slate-200">{fmt(item.value)}</span>
                  {item.insured ? (
                    <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[10px] border border-green-500/30">Insured</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] border border-red-500/30 flex items-center gap-0.5">
                      <AlertTriangle size={10} /> Uninsured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Insured: {summary.insuredItemCount} items</span>
            <span className="text-amber-400">Uninsured: {summary.uninsuredItemCount} items</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Coverage Recommendations</h4>
        <div className="space-y-3">
          {recommendations.map(rec => (
            <div key={rec.id} className={`border-l-4 rounded-lg p-4 ${priorityColors[rec.priority] || 'border-l-slate-500'}`}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-200">{rec.title}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                      rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      rec.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{rec.priority}</span>
                  </div>
                  <p className="text-xs text-slate-400">{rec.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${rec.estimatedCostChange < 0 ? 'text-green-400' : 'text-amber-400'}`}>
                    {rec.estimatedCostChange < 0 ? '-' : '+'}{fmt(Math.abs(rec.estimatedCostChange))}/yr
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page Component ─────────────────────────────────────────────────────

const InsuranceAppraisal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Appraisals');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<AppraisalReport[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [recommendations, setRecommendations] = useState<CoverageRecommendation[]>([]);
  const [summary, setSummary] = useState<CollectionValuationSummary | null>(null);

  useEffect(() => {
    try {
      setReports(getAppraisalHistory());
      setPolicies(getInsurancePolicies());
      setClaims(getClaims());
      const val = getCollectionValuationSummary();
      setSummary(val);
      setRecommendations(getCoverageRecommendations(val.totalFairMarketValue));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const handleGenerate = () => {
    const newReport = generateAppraisalReport([]);
    setReports(prev => [newReport, ...prev]);
  };

  const handleCreatePolicy = () => {
    const newPolicy = createPolicy({
      coverageLevel: 'standard',
      provider: 'collectibles_insurance',
      coverageAmount: 200000,
      coveredItems: 10,
    });
    setPolicies(prev => [newPolicy, ...prev]);
  };

  const handleFileClaim = () => {
    if (policies.filter(p => p.status === 'active').length === 0) return;
    const activePolicy = policies.find(p => p.status === 'active')!;
    const newClaim = fileClaim(activePolicy.id, {
      description: 'New claim filed via dashboard.',
      claimAmount: 5000,
      category: 'damage',
      affectedItems: ['Item pending specification'],
    });
    setClaims(prev => [newClaim, ...prev]);
  };

  const tabIcons: Record<Tab, React.ReactNode> = {
    Appraisals: <FileText size={16} />,
    Policies: <Shield size={16} />,
    Claims: <AlertTriangle size={16} />,
    'Coverage Analyzer': <BarChart3 size={16} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading insurance & appraisal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={28} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-100">Insurance & Appraisal Pipeline</h1>
          </div>
          <p className="text-sm text-slate-400 ml-10">Manage appraisals, policies, claims, and coverage analysis for your collection.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-slate-700 pb-px">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tabIcons[tab]}
              {tab}
              {tab === 'Claims' && claims.filter(c => c.status === 'under_review' || c.status === 'filed').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  {claims.filter(c => c.status === 'under_review' || c.status === 'filed').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Appraisals' && (
          <AppraisalsTab reports={reports} onGenerate={handleGenerate} />
        )}
        {activeTab === 'Policies' && (
          <PoliciesTab policies={policies} onCreatePolicy={handleCreatePolicy} />
        )}
        {activeTab === 'Claims' && (
          <ClaimsTab claims={claims} onFileClaim={handleFileClaim} />
        )}
        {activeTab === 'Coverage Analyzer' && summary && (
          <CoverageAnalyzerTab summary={summary} recommendations={recommendations} />
        )}
      </div>
    </div>
  );
};

export default InsuranceAppraisal;
