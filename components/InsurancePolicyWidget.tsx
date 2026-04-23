// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CalendarClock,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getPolicies,
  analyzeCoverageGaps,
  getRenewalReminders,
  ensureSampleData,
} from '../lib/core/insurancePolicyService';

interface InsurancePolicyWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const InsurancePolicyWidget: React.FC<InsurancePolicyWidgetProps> = ({ cards, onClick }) => {
  const { policies, coverageRatio, nextRenewal, underInsuredCount } = useMemo(() => {
    ensureSampleData();
    const pols = getPolicies();
    const activePolicies = pols.filter(p => p.status === 'active');

    // Coverage ratio
    const totalValue = cards.reduce(
      (s, c) => s + (c.currentValue ?? c.purchasePrice),
      0
    );
    const totalCoverage = activePolicies.reduce((s, p) => s + p.coverageAmount, 0);
    const ratio = totalValue > 0 ? Math.min(100, Math.round((totalCoverage / totalValue) * 100)) : 0;

    // Next renewal
    const reminders = getRenewalReminders(pols);
    const next = reminders.length > 0 ? reminders[0] : null;

    // Under-insured alerts
    const gaps = analyzeCoverageGaps(pols, cards);
    const underInsured = gaps.filter(g => g.severity === 'critical' || g.severity === 'warning').length;

    return {
      policies: pols,
      coverageRatio: ratio,
      nextRenewal: next,
      underInsuredCount: underInsured,
    };
  }, [cards]);

  const coverageColor =
    coverageRatio >= 80
      ? 'text-green-400'
      : coverageRatio >= 50
        ? 'text-amber-400'
        : 'text-red-400';

  const coverageBarColor =
    coverageRatio >= 80
      ? 'bg-green-500'
      : coverageRatio >= 50
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Insurance <span className="text-blue-400">Coverage</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Policy management & gap analysis
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Coverage Ratio */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Coverage Ratio</span>
          <span className={`text-2xl font-bebas tracking-wider ${coverageColor}`}>
            {coverageRatio}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${coverageBarColor}`}
            style={{ width: `${coverageRatio}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>{policies.filter(p => p.status === 'active').length} active {policies.filter(p => p.status === 'active').length === 1 ? 'policy' : 'policies'}</span>
          <span>Target: 100%</span>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 text-xs">
        {/* Next Renewal */}
        {nextRenewal && (
          <div className="flex items-center gap-2">
            <CalendarClock size={14} className={
              nextRenewal.urgency === 'urgent'
                ? 'text-red-400'
                : nextRenewal.urgency === 'upcoming'
                  ? 'text-amber-400'
                  : 'text-slate-400'
            } />
            <span className="text-slate-400">Renewal:</span>
            <span className={`font-bold ${
              nextRenewal.urgency === 'urgent'
                ? 'text-red-400'
                : nextRenewal.urgency === 'upcoming'
                  ? 'text-amber-400'
                  : 'text-white'
            }`}>
              {nextRenewal.daysUntilExpiry}d
            </span>
          </div>
        )}

        {/* Under-insured alerts */}
        {underInsuredCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-md">
              {underInsuredCount} gap{underInsuredCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default InsurancePolicyWidget;
