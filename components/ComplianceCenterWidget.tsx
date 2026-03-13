import React, { useMemo } from 'react';
import { FileCheck, ChevronRight, AlertTriangle, Shield, Calendar } from 'lucide-react';
import { getComplianceStats, getComplianceAlerts } from '../lib/complianceCenterService';

interface ComplianceCenterWidgetProps {
  onOpenModal?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export const ComplianceCenterWidget: React.FC<ComplianceCenterWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => getComplianceStats(), []);
  const alerts = useMemo(() => getComplianceAlerts(), []);

  const hasCritical = alerts.some(a => a.severity === 'critical');
  const nextDeadline = alerts.find(a => a.deadline)?.deadline ?? null;

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <FileCheck size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Compliance Center</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tax & Regulatory Status</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-brand-lime transition-colors" />
      </div>

      {/* Compliance Score */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className={scoreColor(stats.complianceScore)} />
          <span className={`text-3xl font-bebas tracking-wide ${scoreColor(stats.complianceScore)}`}>
            {stats.complianceScore}
          </span>
          <span className="text-xs text-slate-500 font-medium">/100</span>
        </div>

        {hasCritical && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={12} className="text-red-400" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Critical Alert</span>
          </div>
        )}
      </div>

      {/* 1099 Threshold Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">1099-K Threshold ($600)</span>
          <span className="text-xs text-slate-300 font-bold">{stats.threshold1099Progress}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              stats.threshold1099Progress >= 90 ? 'bg-red-500' :
              stats.threshold1099Progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${stats.threshold1099Progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-amber-400" />
          <span className="text-xs text-slate-300">
            <span className="font-bold text-amber-400">{stats.activeAlerts}</span> active alerts
          </span>
        </div>
        {nextDeadline && (
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">{nextDeadline}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ComplianceCenterWidget;
