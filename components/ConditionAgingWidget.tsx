import React, { useMemo } from 'react';
import { ShieldCheck, ChevronRight, AlertTriangle, TrendingDown } from 'lucide-react';
import {
  getCollectionHealthReport,
  getStorageRecommendations,
  getInsuranceTriggers,
} from '../lib/conditionAgingService';

interface ConditionAgingWidgetProps {
  onOpenModal?: () => void;
}

const ConditionAgingWidget: React.FC<ConditionAgingWidgetProps> = ({ onOpenModal }) => {
  const healthReport = useMemo(() => getCollectionHealthReport(), []);
  const recommendations = useMemo(() => getStorageRecommendations(), []);
  const triggers = useMemo(() => getInsuranceTriggers(), []);

  const criticalTriggers = triggers.filter(t => t.urgency === 'critical').length;

  const scoreColor =
    healthReport.overallScore >= 80 ? 'text-emerald-400' :
    healthReport.overallScore >= 60 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Condition Aging</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Preservation</p>
          <p className={`text-lg font-bold ${scoreColor}`}>{healthReport.overallScore}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">At Risk</p>
          <p className="text-lg font-bold text-rose-400">{healthReport.cardsAtRisk}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Optimal %</p>
          <p className="text-lg font-bold text-emerald-400">{healthReport.optimalStoragePct}%</p>
        </div>
      </div>

      {/* Projected Loss */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> 10-Year Projected Loss
          </span>
          <span className="text-sm font-bold text-rose-400">
            -${healthReport.projectedLoss10yr.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-rose-500 h-1.5 rounded-full"
            style={{ width: `${Math.min(100, (healthReport.projectedLoss10yr / 100000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors bg-cyan-500/10 border-cyan-500/20 hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${criticalTriggers > 0 ? 'text-red-400' : 'text-cyan-400'}`} />
            <div className="text-left">
              <p className="text-xs font-bold text-cyan-400">
                {recommendations.length} Recommendations
              </p>
              <p className="text-[10px] text-slate-400">
                {criticalTriggers > 0 ? `${criticalTriggers} critical alerts` : 'Storage optimization available'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>{triggers.length} triggers</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ConditionAgingWidget;
