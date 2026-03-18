import React, { useMemo } from 'react';
import { Lock, ChevronRight, Thermometer, Shield } from 'lucide-react';
import { getVaultStats, getEnvironmentalAlerts } from '../lib/utils/vaultSecurityService';

interface VaultSecurityWidgetProps {
  onOpenModal?: () => void;
}

export const VaultSecurityWidget: React.FC<VaultSecurityWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => getVaultStats(), []);
  const alerts = useMemo(() => getEnvironmentalAlerts(), []);

  const hasWarning = alerts.some(a => a.severity === 'warning' || a.severity === 'critical');
  const usagePercent = stats.totalCapacity > 0 ? Math.round((stats.totalUsed / stats.totalCapacity) * 100) : 0;
  const insuranceCoverage = stats.totalInsured + stats.insuranceGaps > 0
    ? Math.round((stats.totalInsured / (stats.totalInsured + stats.insuranceGaps)) * 100)
    : 0;

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Vault Security</h3>
            <p className="text-xs text-slate-400 mt-0.5">Storage & Protection Intelligence</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-brand-lime transition-colors" />
      </div>

      {/* Storage Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Storage</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bebas text-white">{stats.totalUsed}</span>
            <span className="text-xs text-slate-500">/ {stats.totalCapacity} cards</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-brand-lime'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Thermometer size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Environment</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bebas text-white">{stats.avgTemperature}°F</span>
            <span className="text-xs text-slate-500">{stats.avgHumidity}% RH</span>
          </div>
          {hasWarning ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
              <Thermometer size={10} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Alert Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
              <Shield size={10} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">All Optimal</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-300">
            Insurance: <span className="font-bold text-brand-lime">{insuranceCoverage}%</span> covered
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">
            <span className="font-bold text-amber-400">{stats.alertCount}</span> alerts
          </span>
        </div>
      </div>
    </button>
  );
};

export default VaultSecurityWidget;
