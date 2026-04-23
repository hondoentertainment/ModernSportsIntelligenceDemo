// @ts-nocheck
import React, { useMemo } from 'react';
import { Fingerprint, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { getDNAStats, getCounterfeitAlerts } from '../lib/core/cardDNAService';

interface CardDNAWidgetProps {
  onViewAll?: () => void;
}

const CardDNAWidget: React.FC<CardDNAWidgetProps> = ({ onViewAll }) => {
  const stats = useMemo(() => getDNAStats(), []);
  const alerts = useMemo(() => getCounterfeitAlerts(), []);

  const criticalAlerts = alerts.filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high');

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Fingerprint size={18} className="text-brand-lime" />
          <h3 className="text-sm font-semibold text-white">Card DNA</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-slate-400 hover:text-brand-lime flex items-center gap-1 transition-colors"
          >
            Details <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.totalScanned}</div>
          <div className="text-xs text-slate-400">Scanned</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{stats.authenticated}</div>
          <div className="text-xs text-slate-400">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{stats.flagged}</div>
          <div className="text-xs text-slate-400">Flagged</div>
        </div>
      </div>

      {/* Authentication Confidence */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Avg. Confidence</span>
          <span className="text-white font-medium">{stats.averageConfidence}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${stats.averageConfidence}%`,
              backgroundColor: stats.averageConfidence >= 80 ? '#34d399' : stats.averageConfidence >= 50 ? '#facc15' : '#f87171',
            }}
          />
        </div>
      </div>

      {/* Alert Indicator */}
      {criticalAlerts.length > 0 ? (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <span className="text-xs text-red-300">
            {criticalAlerts.length} counterfeit alert{criticalAlerts.length > 1 ? 's' : ''} require attention
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-300">No critical alerts</span>
        </div>
      )}
    </div>
  );
};

export default CardDNAWidget;
