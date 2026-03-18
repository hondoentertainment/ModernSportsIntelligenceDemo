import React, { useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  getEstateSummary,
  formatCurrency,
  type EstateSummary,
} from '../lib/utils/generationalWealthService';

interface GenerationalWealthWidgetProps {
  onClick?: () => void;
}

const healthConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  excellent: { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  good: { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  needs_attention: { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export const GenerationalWealthWidget: React.FC<GenerationalWealthWidgetProps> = ({
  onClick,
}) => {
  const summary: EstateSummary = useMemo(() => getEstateSummary(), []);
  const health = healthConfig[summary.estateHealth] || healthConfig.good;

  const preservationRate =
    summary.totalValue > 0
      ? (((summary.totalValue - summary.taxExposure) / summary.totalValue) * 100).toFixed(1)
      : '100.0';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              Generational Wealth
            </h3>
            <p className="text-xs text-slate-500">Estate Planning</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${health.bg} ${health.color}`}>
          {health.label}
        </span>
      </div>

      {/* Estate Value */}
      <div>
        <p className="text-sm text-slate-400 mb-1">Total Estate Value</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalValue)}</p>
        <p className="text-xs text-slate-500 mt-1">{summary.totalAssets} collectible assets</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <AlertTriangle size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-sm font-semibold text-white">
            {summary.taxExposurePercent.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500">Tax Exposure</p>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <Users size={16} className="text-blue-400 mx-auto mb-1" />
          <p className="text-sm font-semibold text-white">{summary.beneficiaryCount}</p>
          <p className="text-xs text-slate-500">Beneficiaries</p>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-sm font-semibold text-white">{preservationRate}%</p>
          <p className="text-xs text-slate-500">Preserved</p>
        </div>
      </div>

      {/* Next Review */}
      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} />
          <span className="text-xs">Next Review</span>
        </div>
        <span className="text-sm text-white font-medium">{summary.nextReviewDate}</span>
      </div>
    </button>
  );
};

export default GenerationalWealthWidget;
