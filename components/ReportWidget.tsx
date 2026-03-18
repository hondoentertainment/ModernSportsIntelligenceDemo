import React, { useMemo, useState } from 'react';
import {
  FileText,
  FileBarChart,
  Shield,
  TrendingUp,
  Receipt,
  Clock,
  ChevronRight,
  BarChart3,
  BriefcaseBusiness,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  ReportType,
  getReportHistory,
  generateCollectorAuditDossier,
  generatePortfolioSummary,
  generateTaxReport,
  generateInsuranceReport,
  generatePerformanceReport,
  saveReportToHistory,
  cacheReport,
  GeneratedReport,
} from '../lib/utils/reportService';

interface ReportWidgetProps {
  inventory: CardInventory[];
  onOpenModal?: (_report?: GeneratedReport) => void;
}

const reportButtons: { type: ReportType; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  {
    type: 'portfolio_summary',
    label: 'Portfolio Summary',
    icon: <FileBarChart size={16} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    type: 'tax',
    label: 'Tax Report',
    icon: <Receipt size={16} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    type: 'insurance',
    label: 'Insurance',
    icon: <Shield size={16} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    type: 'performance',
    label: 'Performance',
    icon: <TrendingUp size={16} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    type: 'collector_audit_dossier',
    label: 'Audit Dossier',
    icon: <BriefcaseBusiness size={16} />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
];

function generateReport(type: ReportType, inventory: CardInventory[]): GeneratedReport {
  const config = { includeSold: true, sections: [type] };
  switch (type) {
    case 'portfolio_summary': return generatePortfolioSummary(inventory, config);
    case 'tax': return generateTaxReport(inventory, config);
    case 'insurance': return generateInsuranceReport(inventory, config);
    case 'performance': return generatePerformanceReport(inventory, config);
    case 'collector_audit_dossier': return generateCollectorAuditDossier(inventory, config);
  }
}

export const ReportWidget: React.FC<ReportWidgetProps> = ({ inventory, onOpenModal }) => {
  const [generating, setGenerating] = useState<ReportType | null>(null);

  const history = useMemo(() => getReportHistory(), []);
  const lastReport = history.length > 0 ? history[0] : null;
  const lastReportDate = lastReport
    ? new Date(lastReport.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const handleQuickGenerate = (type: ReportType) => {
    setGenerating(type);
    // Small timeout to show the generating state
    setTimeout(() => {
      const report = generateReport(type, inventory);
      saveReportToHistory(report);
      cacheReport(report);
      setGenerating(null);
      onOpenModal?.(report);
    }, 100);
  };

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Collection <span className="text-blue-400">Reports</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Analytics &amp; export engine
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => onOpenModal?.()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <BarChart3 size={12} />
            {history.length} report{history.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Quick generate buttons */}
      <div className="grid grid-cols-2 gap-2">
        {reportButtons.map(btn => (
          <button
            key={btn.type}
            onClick={() => handleQuickGenerate(btn.type)}
            disabled={generating !== null}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all group
              ${btn.bg} ${btn.border} hover:brightness-125
              ${generating === btn.type ? 'opacity-70 animate-pulse' : ''}
              disabled:cursor-wait`}
          >
            <div className={`p-2 rounded-lg ${btn.bg} ${btn.color}`}>
              {btn.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold ${btn.color} block truncate`}>{btn.label}</span>
              <span className="text-[10px] text-slate-500">
                {generating === btn.type ? 'Generating...' : 'Quick generate'}
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Last generated info */}
      {lastReport && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
          <Clock size={14} className="text-slate-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-slate-400 block">Last report</span>
            <span className="text-xs text-white font-medium truncate block">
              {lastReport.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{lastReportDate}</span>
        </div>
      )}

      {/* Open full modal */}
      <button
        onClick={() => onOpenModal?.()}
        className="w-full flex items-center justify-center gap-2 p-3.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl text-sm font-medium transition-all"
      >
        <FileText size={16} />
        Open Report Builder
      </button>
    </div>
  );
};

export default ReportWidget;
