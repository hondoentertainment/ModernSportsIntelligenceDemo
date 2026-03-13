import React, { useMemo } from 'react';
import { Shield, ChevronRight, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  getEstatePlan,
  getBeneficiaries,
  getInsuranceRecords,
  getEstateValuation,
} from '../lib/estatePlanningService';

interface EstatePlanningWidgetProps {
  onViewAll?: () => void;
}

const EstatePlanningWidget: React.FC<EstatePlanningWidgetProps> = ({ onViewAll }) => {
  const plan = useMemo(() => getEstatePlan(), []);
  const beneficiaries = useMemo(() => getBeneficiaries(), []);
  const insurance = useMemo(() => getInsuranceRecords(), []);
  const valuation = useMemo(() => getEstateValuation(), []);

  const totalCoverage = insurance.reduce((sum, r) => sum + r.coverage, 0);
  const isCovered = totalCoverage >= valuation.currentTotal;

  const expiringSoon = insurance.filter((r) => {
    const expires = new Date(r.expiresAt);
    const now = new Date();
    const diffDays = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 90;
  });

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-lime-400" />
          <h3 className="text-sm font-semibold text-white">Estate Planning</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-slate-400 hover:text-lime-400 transition-colors flex items-center gap-1"
          >
            View <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Estate Value */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-1">Estate Value</p>
        <p className="text-2xl font-bold text-white">
          ${plan.totalValue.toLocaleString()}
        </p>
        <span
          className={`text-xs font-medium ${
            valuation.changePercent30d >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {valuation.changePercent30d >= 0 ? '+' : ''}
          {valuation.changePercent30d.toFixed(1)}% (30d)
        </span>
      </div>

      {/* Beneficiaries */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-slate-800/60 rounded-lg">
        <Users size={14} className="text-slate-400" />
        <span className="text-xs text-slate-300">
          {beneficiaries.length} Beneficiaries
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          {beneficiaries.reduce((sum, b) => sum + b.assignedCards.length, 0)} cards assigned
        </span>
      </div>

      {/* Insurance Status */}
      <div
        className={`flex items-center gap-2 p-2 rounded-lg ${
          isCovered
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}
      >
        {isCovered ? (
          <ShieldCheck size={14} className="text-emerald-400" />
        ) : (
          <AlertTriangle size={14} className="text-red-400" />
        )}
        <span className={`text-xs font-medium ${isCovered ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCovered ? 'Fully Insured' : 'Coverage Gap'}
        </span>
        <span className="text-xs text-slate-500 ml-auto">
          ${totalCoverage.toLocaleString()}
        </span>
      </div>

      {/* Expiring Soon Warning */}
      {expiringSoon.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
          <AlertTriangle size={12} />
          <span>{expiringSoon.length} policy expiring within 90 days</span>
        </div>
      )}
    </div>
  );
};

export default EstatePlanningWidget;
