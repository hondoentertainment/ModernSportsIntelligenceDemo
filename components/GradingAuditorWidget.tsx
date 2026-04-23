// @ts-nocheck
import React, { useMemo } from 'react';
import { ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  getTrustScores,
  getAuditorAlerts,
  getCrossoverResults,
  getSeverityConfig,
  getCompanyConfig,
} from '../lib/core/gradingAuditorService';

interface GradingAuditorWidgetProps {
  onOpenModal?: () => void;
}

const GradingAuditorWidget: React.FC<GradingAuditorWidgetProps> = ({ onOpenModal }) => {
  const trustScores = useMemo(() => getTrustScores(), []);
  const alerts = useMemo(() => getAuditorAlerts(), []);
  const crossovers = useMemo(() => getCrossoverResults(), []);

  const topGrader = trustScores.reduce((best, s) => (s.overall > best.overall ? s : best), trustScores[0]);
  const avgTrust = Math.round(trustScores.reduce((sum, s) => sum + s.overall, 0) / trustScores.length);
  const activeAlerts = alerts.filter(a => a.severity === 'warning' || a.severity === 'critical').length;
  const crossoverSuccessRate = crossovers.length > 0
    ? Math.round(crossovers.filter(c => c.success).length / crossovers.length * 100)
    : 0;

  const latestAlert = alerts.sort((a, b) => b.date.localeCompare(a.date))[0];
  const alertConfig = latestAlert ? getSeverityConfig(latestAlert.severity) : null;
  const topConfig = getCompanyConfig(topGrader.company);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Grading Auditor</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Top Grader</p>
          <p className={`text-lg font-bold ${topConfig.text}`}>{topConfig.label}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Avg Trust</p>
          <p className={`text-lg font-bold ${avgTrust >= 75 ? 'text-emerald-400' : avgTrust >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgTrust}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Active Alerts</p>
          <p className={`text-lg font-bold ${activeAlerts > 3 ? 'text-red-400' : activeAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{activeAlerts}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Crossover %</p>
          <p className={`text-lg font-bold ${crossoverSuccessRate >= 70 ? 'text-emerald-400' : crossoverSuccessRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{crossoverSuccessRate}%</p>
        </div>
      </div>

      {/* Latest Alert Highlight */}
      {latestAlert && alertConfig && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${alertConfig.text}`} />
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${alertConfig.bg} ${alertConfig.text}`}>{alertConfig.label}</span>
            <span className="text-xs text-slate-300 font-medium truncate">{latestAlert.title}</span>
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-2">{latestAlert.description}</p>
        </div>
      )}

      {/* Bottom Section */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors bg-emerald-500/10 border-emerald-500/20 hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-400">{trustScores.length} Companies Tracked</p>
              <p className="text-[10px] text-slate-400">{crossovers.length} crossover results analyzed</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>{alerts.length} alerts</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default GradingAuditorWidget;
