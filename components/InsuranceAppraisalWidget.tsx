import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import {
  getInsurancePolicies,
  getCollectionValuationSummary,
  type InsurancePolicy,
  type CollectionValuationSummary,
} from '../lib/insuranceAppraisalService';

interface InsuranceAppraisalWidgetProps {
  onNavigate?: () => void;
}

const fmt = (n: number) => `$${n.toLocaleString()}`;

const InsuranceAppraisalWidget: React.FC<InsuranceAppraisalWidgetProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CollectionValuationSummary | null>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);

  useEffect(() => {
    try {
      setSummary(getCollectionValuationSummary());
      setPolicies(getInsurancePolicies());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-full" />
      </div>
    );
  }

  if (!summary) return null;

  const activePolicies = policies.filter(p => p.status === 'active');
  const totalCoverage = activePolicies.reduce((s, p) => s + p.coverageAmount, 0);
  const coverageRatio = summary.totalFairMarketValue > 0
    ? Math.round((totalCoverage / summary.totalFairMarketValue) * 100)
    : 0;
  const isUnderInsured = coverageRatio < 95;

  // Find nearest renewal
  const nextRenewal = activePolicies
    .map(p => ({ date: p.renewalDate, provider: p.providerName }))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const daysToRenewal = nextRenewal
    ? Math.max(0, Math.ceil((new Date(nextRenewal.date).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div
      className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500/40 transition-colors cursor-pointer"
      onClick={onNavigate}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Insurance & Appraisal</h3>
        </div>
        {isUnderInsured && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
            <AlertTriangle size={10} /> Under-Insured
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Portfolio Value</p>
          <p className="text-lg font-bold text-green-400">{fmt(summary.totalFairMarketValue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Coverage</p>
          <p className="text-lg font-bold text-blue-400">{fmt(totalCoverage)}</p>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Coverage Ratio</span>
          <span className={coverageRatio >= 95 ? 'text-green-400' : coverageRatio >= 80 ? 'text-amber-400' : 'text-red-400'}>
            {coverageRatio}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              coverageRatio >= 95 ? 'bg-green-500' : coverageRatio >= 80 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, coverageRatio)}%` }}
          />
        </div>
      </div>

      {/* Footer details */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        {nextRenewal && daysToRenewal !== null && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Renewal in {daysToRenewal}d
          </span>
        )}
        <span className="flex items-center gap-1">
          {activePolicies.length} active {activePolicies.length === 1 ? 'policy' : 'policies'}
        </span>
        <ChevronRight size={12} className="text-slate-600" />
      </div>
    </div>
  );
};

export default InsuranceAppraisalWidget;
