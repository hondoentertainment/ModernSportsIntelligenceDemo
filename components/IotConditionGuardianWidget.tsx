import React, { useMemo } from 'react';
import { Thermometer, ChevronRight, AlertTriangle, Shield, Wifi } from 'lucide-react';
import {
  getGuardianStats,
  getEnvironmentZones,
  getConditionAlerts,
  getRiskColor,
  getSeverityColor,
} from '../lib/utils/iotConditionGuardianService';

interface IotConditionGuardianWidgetProps {
  onOpenModal?: () => void;
}

const IotConditionGuardianWidget: React.FC<IotConditionGuardianWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => getGuardianStats(), []);
  const zones = useMemo(() => getEnvironmentZones(), []);
  const alerts = useMemo(() => getConditionAlerts(), []);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">IoT Guardian</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3-Col Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Sensors Online</p>
          <p className="text-lg font-bold text-emerald-400">
            {stats.onlineSensors}/{stats.totalSensors}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Active Alerts</p>
          <p className={`text-lg font-bold ${stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.activeAlerts}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Health Score</p>
          <p className={`text-lg font-bold ${
            stats.avgHealthScore >= 80 ? 'text-emerald-400' :
            stats.avgHealthScore >= 60 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {stats.avgHealthScore}%
          </p>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-red-300/80 leading-relaxed">
            {criticalAlerts[0].message.slice(0, 80)}...
          </p>
        </div>
      )}

      {/* Zone Health Bars */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Zone Health
        </h4>
        <div className="space-y-2.5">
          {zones.map(zone => {
            const riskColor = getRiskColor(zone.riskLevel);
            return (
              <button
                key={zone.id}
                onClick={onOpenModal}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                    {zone.name}
                  </span>
                  <span className={`text-xs font-bold ${riskColor.text}`}>
                    {zone.healthScore}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      zone.healthScore >= 80 ? 'bg-emerald-500' :
                      zone.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${zone.healthScore}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Protected */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-400">Cards Protected</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">
            {stats.cardsProtected.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IotConditionGuardianWidget;
