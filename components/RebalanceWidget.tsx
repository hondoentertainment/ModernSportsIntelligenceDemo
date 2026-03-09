import React, { useMemo } from 'react';
import {
  Scale,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  RebalanceAlert,
  generateRebalanceAlerts,
  getPortfolioHealth,
  SportDrift,
} from '../lib/rebalancingAlertService';

interface RebalanceWidgetProps {
  inventory: CardInventory[];
  onAlertClick?: (alert: RebalanceAlert) => void;
}

const sportBarColors: Record<string, string> = {
  Baseball: 'bg-red-500',
  Basketball: 'bg-orange-500',
  Football: 'bg-green-500',
  Hockey: 'bg-blue-500',
  Soccer: 'bg-purple-500',
};

const healthColor = (score: number): string => {
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-[#ADFF2F]';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const healthBg = (score: number): string => {
  if (score >= 90) return 'bg-green-500/10 border-green-500/30';
  if (score >= 75) return 'bg-[#ADFF2F]/10 border-[#ADFF2F]/30';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
  if (score >= 40) return 'bg-orange-500/10 border-orange-500/30';
  return 'bg-red-500/10 border-red-500/30';
};

const severityIcon: Record<string, React.ReactNode> = {
  critical: <AlertTriangle size={14} className="text-red-400" />,
  warning: <AlertCircle size={14} className="text-orange-400" />,
  info: <Info size={14} className="text-blue-400" />,
};

const severityDot: Record<string, string> = {
  critical: 'bg-red-400',
  warning: 'bg-orange-400',
  info: 'bg-blue-400',
};

const RebalanceWidget: React.FC<RebalanceWidgetProps> = ({ inventory, onAlertClick }) => {
  const health = useMemo(() => getPortfolioHealth(inventory), [inventory]);
  const alerts = useMemo(() => {
    const all = generateRebalanceAlerts(inventory);
    return all.filter((a) => !a.isAcknowledged);
  }, [inventory]);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const a of alerts) {
      counts[a.severity]++;
    }
    return counts;
  }, [alerts]);

  const topAlerts = alerts.slice(0, 3);
  const maxAlloc = useMemo(() => {
    let max = 0;
    for (const d of health.drifts) {
      max = Math.max(max, d.actualPercent, d.targetPercent);
    }
    return Math.max(max, 1);
  }, [health.drifts]);

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Scale size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Portfolio <span className="text-brand-lime">Balance</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Rebalancing alerts &amp; drift monitor
            </p>
          </div>
        </div>

        {/* Health badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${healthBg(health.score)}`}
        >
          <span className={`text-2xl font-bebas tracking-wider ${healthColor(health.score)}`}>
            {health.score}
          </span>
          <div className="text-left">
            <div className={`text-[10px] font-black uppercase tracking-widest ${healthColor(health.score)}`}>
              {health.label}
            </div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Health</div>
          </div>
        </div>
      </div>

      {/* Allocation Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Allocation vs Target
        </h4>
        <div className="space-y-2.5">
          {health.drifts.map((drift: SportDrift) => (
            <div key={drift.sport} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium w-20">{drift.sport}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{drift.actualPercent.toFixed(1)}%</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-[#ADFF2F]/70 text-[11px]">{drift.targetPercent}%</span>
                  {drift.absDrift > 2 && (
                    <span className="flex items-center gap-0.5">
                      {drift.driftAmount > 0 ? (
                        <ArrowUpRight size={10} className="text-red-400" />
                      ) : (
                        <ArrowDownRight size={10} className="text-blue-400" />
                      )}
                      <span
                        className={`text-[10px] font-bold ${drift.driftAmount > 0 ? 'text-red-400' : 'text-blue-400'}`}
                      >
                        {drift.driftAmount > 0 ? '+' : ''}
                        {drift.driftAmount.toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#ADFF2F]/40 z-10"
                  style={{ left: `${(drift.targetPercent / maxAlloc) * 100}%` }}
                />
                {/* Actual bar */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ${sportBarColors[drift.sport] ?? 'bg-slate-500'}`}
                  style={{ width: `${Math.min((drift.actualPercent / maxAlloc) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts Summary */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Active Alerts
            </h4>
            <div className="flex items-center gap-2">
              {severityCounts.critical > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {severityCounts.critical}
                </span>
              )}
              {severityCounts.warning > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {severityCounts.warning}
                </span>
              )}
              {severityCounts.info > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-blue-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {severityCounts.info}
                </span>
              )}
            </div>
          </div>

          {/* Top 3 alerts */}
          <div className="space-y-1.5">
            {topAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => onAlertClick?.(alert)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all text-left group"
              >
                <div className="flex-shrink-0">{severityIcon[alert.severity]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-semibold truncate">{alert.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {alert.recommendedAction}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
                />
              </button>
            ))}
          </div>

          {/* View All */}
          {alerts.length > 3 && (
            <button
              onClick={() => {
                if (alerts[0] && onAlertClick) onAlertClick(alerts[0]);
              }}
              className="w-full text-center text-xs text-brand-lime/70 hover:text-brand-lime font-bold uppercase tracking-widest py-2 transition-colors"
            >
              View All {alerts.length} Alerts
            </button>
          )}
        </div>
      )}

      {/* No alerts state */}
      {alerts.length === 0 && (
        <div className="text-center py-4">
          <div className="text-[#ADFF2F]/60 text-xs font-bold uppercase tracking-widest">
            Portfolio balanced
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            All allocations are within tolerance bands
          </p>
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">
          {health.totalCards} cards &middot; ${health.totalValue.toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default RebalanceWidget;
