import React from 'react';
import { RefreshCw, ChevronRight, DollarSign, ArrowRightLeft } from 'lucide-react';
import { getCrossGradeOpportunities, getGradingArbitrageStats } from '../lib/gradingArbitrageService.ts';

interface Props {
  onOpenModal?: () => void;
}

const riskColors: Record<string, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

const GradingArbitrageWidget: React.FC<Props> = ({ onOpenModal }) => {
  const stats = getGradingArbitrageStats();
  const topOpp = getCrossGradeOpportunities()[0];

  return (
    <div
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-lime-500/30 transition-all cursor-pointer"
      onClick={onOpenModal}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <RefreshCw size={16} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Grading Arbitrage</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      {topOpp ? (
        <div className="space-y-3">
          {/* Top opportunity */}
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300 truncate">{topOpp.player}</span>
              <span className="text-xs font-bold text-lime-400">+{topOpp.netROI}% ROI</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mb-2">{topOpp.cardDescription}</p>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-medium">
                {topOpp.currentCompany} {topOpp.currentGrade}
              </span>
              <ArrowRightLeft size={10} className="text-slate-500" />
              <span className="px-1.5 py-0.5 bg-lime-500/20 text-lime-300 rounded font-medium">
                {topOpp.targetCompany} {topOpp.expectedGrade}
              </span>
              <span className={`ml-auto ${riskColors[topOpp.riskLevel]}`}>
                {topOpp.gradeUpProbability}% success
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-slate-400">
              <DollarSign size={10} />
              <span>${stats.totalPotentialProfit.toLocaleString()} potential</span>
            </div>
            <span className="text-slate-500">
              {stats.activeSubmissions} active submission{stats.activeSubmissions !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <ArrowRightLeft size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No cross-grade opportunities found</p>
        </div>
      )}
    </div>
  );
};

export default GradingArbitrageWidget;
