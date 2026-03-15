import React, { useMemo } from 'react';
import { Thermometer, ChevronRight, AlertTriangle, Activity } from 'lucide-react';
import {
  getStorageZones,
  getEnvironmentalAlerts,
  getSensorReadings,
  formatCurrency,
} from '../lib/smartStorageService';

interface SmartStorageWidgetProps {
  onOpenModal?: () => void;
}

export const SmartStorageWidget: React.FC<SmartStorageWidgetProps> = ({ onOpenModal }) => {
  const zones = useMemo(() => getStorageZones(), []);
  const alerts = useMemo(() => getEnvironmentalAlerts(), []);
  const sensors = useMemo(() => getSensorReadings(), []);

  const activeZones = zones.length;

  const avgTemp = useMemo(() => {
    if (sensors.length === 0) return 0;
    return (sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length).toFixed(1);
  }, [sensors]);

  const avgHumidity = useMemo(() => {
    if (sensors.length === 0) return 0;
    return (sensors.reduce((sum, s) => sum + s.humidity, 0) / sensors.length).toFixed(1);
  }, [sensors]);

  const activeAlerts = useMemo(() => alerts.filter(a => !a.acknowledged).length, [alerts]);

  const criticalAlert = useMemo(() => {
    return alerts
      .filter(a => !a.acknowledged)
      .sort((a, b) => {
        const sev: Record<string, number> = { critical: 3, warning: 2, info: 1 };
        return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
      })[0] || null;
  }, [alerts]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Thermometer size={16} className="text-cyan-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Smart Storage IoT</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Zones Active</p>
          <p className="text-lg font-bold text-cyan-400">{activeZones}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Temp</p>
          <p className="text-lg font-bold text-white">{avgTemp}&deg;F</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Humidity</p>
          <p className="text-lg font-bold text-emerald-400">{avgHumidity}%</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Active Alerts</p>
          <p className="text-lg font-bold text-amber-400">{activeAlerts}</p>
        </div>
      </div>

      {/* Most critical environmental alert */}
      {criticalAlert && (
        <div className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl mb-4">
          <AlertTriangle size={14} className="text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Critical Alert</p>
            <p className="text-xs text-white font-medium truncate">{criticalAlert.message}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-amber-400 capitalize">{criticalAlert.severity}</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Sensors: <span className="text-white font-bold">{sensors.length}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-cyan-400" />
          <span className="text-xs text-slate-400">
            Zones: <span className="text-cyan-400 font-bold">{zones.length}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default SmartStorageWidget;
