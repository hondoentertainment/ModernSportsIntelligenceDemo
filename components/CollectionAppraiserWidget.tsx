import React, { useMemo } from 'react';
import { FileCheck, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import {
  getAppraisalReports,
  getGradingResults,
  getInsuranceCoverage,
  getCollectionSummary,
  formatCurrency,
} from '../lib/core/collectionAppraiserService';

interface CollectionAppraiserWidgetProps {
  onOpenModal?: () => void;
}

export const CollectionAppraiserWidget: React.FC<CollectionAppraiserWidgetProps> = ({ onOpenModal }) => {
  const reports = useMemo(() => getAppraisalReports(), []);
  const grading = useMemo(() => getGradingResults(), []);
  const insurance = useMemo(() => getInsuranceCoverage(), []);
  const summary = useMemo(() => getCollectionSummary(), []);

  const topCard = useMemo(() => {
    if (reports.length === 0) return null;
    return reports.reduce((best, r) => r.appraisedValue > best.appraisedValue ? r : best, reports[0]);
  }, [reports]);

  const avgGrade = useMemo(() => {
    if (grading.length === 0) return 0;
    return grading.reduce((sum, g) => sum + g.grade, 0) / grading.length;
  }, [grading]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileCheck size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Collection Appraiser</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Total Value</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.totalValue)}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Cards Appraised</p>
          <p className="text-lg font-bold text-white">{reports.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Grade</p>
          <p className="text-lg font-bold text-amber-400">{avgGrade.toFixed(1)}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Insurance Coverage</p>
          <p className="text-lg font-bold text-violet-400">{formatCurrency(insurance.coverageAmount)}</p>
        </div>
      </div>

      {/* Top card highlight */}
      {topCard && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4">
          <Award size={14} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Highest Appraisal</p>
            <p className="text-xs text-white font-medium truncate">{topCard.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Value</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(topCard.appraisedValue)}</p>
          </div>
        </div>
      )}

      {/* Bottom: graded count + insurance status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileCheck size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">Graded: <span className="text-white font-bold">{grading.length} cards</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-violet-400" />
          <span className="text-xs text-slate-400">
            Coverage: <span className="text-violet-400 font-bold">{insurance.coveragePercent}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default CollectionAppraiserWidget;
