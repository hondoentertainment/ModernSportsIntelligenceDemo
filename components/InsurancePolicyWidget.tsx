import React, { useMemo } from 'react';
import {
  Shield,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  InsurancePolicyService,
  InsuranceSummary,
  RenewalReminder,
} from '../lib/insurancePolicyService';

interface InsurancePolicyWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const InsurancePolicyWidget: React.FC<InsurancePolicyWidgetProps> = ({
  cards,
  onClick,
}) => {
  const summary = useMemo<InsuranceSummary>(
    () => InsurancePolicyService.generateSummary(cards),
    [cards]
  );

  const reminders = useMemo<RenewalReminder[]>(
    () => InsurancePolicyService.getRenewalReminders(cards),
    [cards]
  );

  const riderRecs = useMemo(
    () => InsurancePolicyService.getHighValueRiderRecommendations(cards),
    [cards]
  );

  const coverageRatioPct = Math.min(100, Math.round(summary.coverageRatio * 100));
  const coverageColor =
    coverageRatioPct >= 95
      ? 'text-green-400'
      : coverageRatioPct >= 70
      ? 'text-amber-400'
      : 'text-red-400';
  const coverageBg =
    coverageRatioPct >= 95
      ? 'bg-green-400'
      : coverageRatioPct >= 70
      ? 'bg-amber-400'
      : 'bg-red-400';

  const nextReminder = reminders.length > 0 ? reminders[0] : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Insurance <span className="text-emerald-400">Manager</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Policy tracking & coverage analysis
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Coverage Ratio + Total Coverage */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Coverage Ratio
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${coverageColor}`}>
            {summary.activePolicies > 0 ? `${coverageRatioPct}%` : 'No Policies'}
          </p>
          {/* Coverage bar */}
          {summary.activePolicies > 0 && (
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${coverageBg}`}
                style={{ width: `${coverageRatioPct}%` }}
              />
            </div>
          )}
        </div>
        <div className="h-10 w-px bg-slate-700" />
        <div className="flex-1 text-right">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Total Coverage
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {summary.activePolicies > 0
              ? `$${summary.totalCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : '$0'}
          </p>
        </div>
      </div>

      {/* Under-insured Alert */}
      {summary.isUnderInsured && summary.activePolicies > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/5 border border-red-500/15 rounded-xl">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-400 font-medium">
            Under-insured by ${summary.coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="ml-auto text-[10px] text-red-400/60 font-mono flex-shrink-0">
            {coverageRatioPct}% covered
          </span>
        </div>
      )}

      {/* Next Renewal */}
      {nextReminder && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            nextReminder.alertLevel === 'urgent'
              ? 'bg-red-500/5 border border-red-500/15'
              : nextReminder.alertLevel === 'warning'
              ? 'bg-amber-500/5 border border-amber-500/15'
              : 'bg-blue-500/5 border border-blue-500/15'
          }`}
        >
          <Clock
            size={14}
            className={`flex-shrink-0 ${
              nextReminder.alertLevel === 'urgent'
                ? 'text-red-400'
                : nextReminder.alertLevel === 'warning'
                ? 'text-amber-400'
                : 'text-blue-400'
            }`}
          />
          <span className="text-xs text-slate-400 flex-shrink-0">Renewal:</span>
          <span className="text-xs text-white font-medium truncate">
            {nextReminder.provider}
          </span>
          <span
            className={`ml-auto text-xs font-bold flex-shrink-0 ${
              nextReminder.alertLevel === 'urgent'
                ? 'text-red-400'
                : nextReminder.alertLevel === 'warning'
                ? 'text-amber-400'
                : 'text-blue-400'
            }`}
          >
            {nextReminder.daysUntilRenewal}d
          </span>
        </div>
      )}

      {/* Rider Recommendations */}
      {riderRecs.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <FileText size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Riders:</span>
          <span className="text-xs text-white font-medium truncate">
            {riderRecs.length} high-value card{riderRecs.length !== 1 ? 's' : ''} need scheduling
          </span>
          <span className="ml-auto text-xs font-bold text-purple-400 flex-shrink-0">
            ${riderRecs.reduce((s, r) => s + r.currentValue, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}

      {/* Stats Row */}
      {summary.activePolicies > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Policies
            </p>
            <p className="text-sm font-mono font-bold text-white">
              {summary.activePolicies}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Premiums/yr
            </p>
            <p className="text-sm font-mono font-bold text-white">
              ${summary.totalPremiums.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Open Claims
            </p>
            <p
              className={`text-sm font-mono font-bold ${
                summary.openClaims > 0 ? 'text-amber-400' : 'text-green-400'
              }`}
            >
              {summary.openClaims}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {summary.activePolicies === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <TrendingUp size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">
            Add insurance policies to track coverage and get renewal reminders
          </span>
        </div>
      )}
    </button>
  );
};

export default InsurancePolicyWidget;
