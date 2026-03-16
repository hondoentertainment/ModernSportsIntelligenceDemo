import React, { useMemo, useState } from 'react';
import {
  X,
  Thermometer,
  Droplets,
  Sun,
  Activity,
  Shield,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Settings,
  Battery,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  getSensorDevices,
  getSensorReadings,
  getEnvironmentZones,
  getConditionAlerts,
  getGuardianStats,
  getOptimalConditions,
  getRiskColor,
  getSeverityColor,
  getStatusIndicatorColor,
  formatAlertType,
  SensorDevice,
  EnvironmentZone,
  ConditionAlert,
  SensorReading,
  OPTIMAL_TEMP_MIN,
  OPTIMAL_TEMP_MAX,
  OPTIMAL_HUMIDITY_MIN,
  OPTIMAL_HUMIDITY_MAX,
  MAX_UV_INDEX,
  MAX_VIBRATION,
} from '../lib/iotConditionGuardianService';

interface IotConditionGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'zones' | 'sensors' | 'alerts' | 'settings';

const tabDefs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'zones', label: 'Zone Overview', icon: <Shield size={16} /> },
  { id: 'sensors', label: 'Sensors', icon: <Wifi size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

// ---- Zone Overview Tab ----

const ZoneOverviewTab: React.FC<{ zones: EnvironmentZone[]; readings: SensorReading[] }> = ({ zones, readings }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {zones.map(zone => {
      const riskColor = getRiskColor(zone.riskLevel);
      const zoneReadings = readings.filter(r => zone.sensors.includes(r.deviceId));
      const latest = zoneReadings.length > 0 ? zoneReadings.reduce((a, b) =>
        new Date(b.timestamp).getTime() > new Date(a.timestamp).getTime() ? b : a
      ) : null;

      return (
        <div key={zone.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Zone Header */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{zone.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{zone.description.slice(0, 60)}...</p>
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${riskColor.bg} ${riskColor.text} ${riskColor.border}`}>
              {zone.riskLevel}
            </span>
          </div>

          {/* Health Score Ring */}
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={zone.healthScore >= 80 ? '#10b981' : zone.healthScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${zone.healthScore}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${riskColor.text}`}>{zone.healthScore}</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <Thermometer className="w-3.5 h-3.5 text-orange-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{latest?.temperature ?? '--'}&deg;F</p>
                <p className="text-[10px] text-slate-500">Temp</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{latest?.humidity ?? '--'}%</p>
                <p className="text-[10px] text-slate-500">Humidity</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <Sun className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{latest?.uvIndex ?? '--'}</p>
                <p className="text-[10px] text-slate-500">UV Index</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{latest?.vibrationLevel ?? '--'}g</p>
                <p className="text-[10px] text-slate-500">Vibration</p>
              </div>
            </div>
          </div>

          {/* Zone Footer */}
          <div className="px-4 pb-4 flex items-center justify-between text-xs text-slate-400">
            <span>{zone.cardCount} cards &middot; ${zone.totalValue.toLocaleString()}</span>
            <span>{zone.sensors.length} sensors</span>
          </div>
        </div>
      );
    })}
  </div>
);

// ---- Sensors Tab ----

const SensorsTab: React.FC<{ devices: SensorDevice[]; readings: SensorReading[] }> = ({ devices, readings }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {devices.map(device => {
      const statusColor = getStatusIndicatorColor(device.status);
      const deviceReadings = readings
        .filter(r => r.deviceId === device.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latest = deviceReadings[0] || null;

      const batteryColor = device.batteryLevel > 50 ? 'text-emerald-400' :
        device.batteryLevel > 20 ? 'text-amber-400' : 'text-red-400';
      const batteryBg = device.batteryLevel > 50 ? 'bg-emerald-500' :
        device.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500';

      return (
        <div key={device.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          {/* Device Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                device.status === 'online' ? 'bg-emerald-400 animate-pulse' :
                device.status === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
              }`} />
              <h4 className="text-sm font-bold text-white">{device.name}</h4>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {device.status}
            </span>
          </div>

          {/* Device Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span>{device.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Last: {new Date(device.lastReading).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Battery Level */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
                <span className="text-xs text-slate-400">Battery</span>
              </div>
              <span className={`text-xs font-bold ${batteryColor}`}>{device.batteryLevel}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${batteryBg}`}
                style={{ width: `${device.batteryLevel}%` }}
              />
            </div>
          </div>

          {/* Latest Readings */}
          {latest && device.status !== 'offline' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">Temp</p>
                <p className={`text-xs font-bold ${
                  latest.temperature > OPTIMAL_TEMP_MAX || latest.temperature < OPTIMAL_TEMP_MIN
                    ? 'text-red-400' : 'text-emerald-400'
                }`}>{latest.temperature}&deg;F</p>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">Humidity</p>
                <p className={`text-xs font-bold ${
                  latest.humidity > OPTIMAL_HUMIDITY_MAX || latest.humidity < OPTIMAL_HUMIDITY_MIN
                    ? 'text-amber-400' : 'text-emerald-400'
                }`}>{latest.humidity}%</p>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">UV</p>
                <p className={`text-xs font-bold ${
                  latest.uvIndex > MAX_UV_INDEX ? 'text-red-400' : 'text-emerald-400'
                }`}>{latest.uvIndex}</p>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">Vibration</p>
                <p className={`text-xs font-bold ${
                  latest.vibrationLevel > MAX_VIBRATION ? 'text-red-400' : 'text-emerald-400'
                }`}>{latest.vibrationLevel}g</p>
              </div>
            </div>
          )}

          {device.status === 'offline' && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">Sensor offline - no current data</span>
            </div>
          )}

          {/* Firmware */}
          <p className="text-[10px] text-slate-600 mt-3">FW: {device.firmwareVersion}</p>
        </div>
      );
    })}
  </div>
);

// ---- Alerts Tab ----

const AlertsTab: React.FC<{ alerts: ConditionAlert[] }> = ({ alerts }) => {
  const [filter, setFilter] = useState<string>('all');

  const alertTypes = ['all', ...Array.from(new Set(alerts.map(a => a.alertType)))];
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.alertType === filter);
  const sorted = [...filtered].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {alertTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filter === type
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {type === 'all' ? 'All' : formatAlertType(type as ConditionAlert['alertType'])}
          </button>
        ))}
      </div>

      {/* Alert Timeline */}
      <div className="space-y-3">
        {sorted.map(alert => {
          const sevColor = getSeverityColor(alert.severity);
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${sevColor.bg} ${sevColor.border} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg ${sevColor.bg} border ${sevColor.border} flex-shrink-0 mt-0.5`}>
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className={`w-4 h-4 ${sevColor.text}`} />
                    ) : alert.severity === 'warning' ? (
                      <Bell className={`w-4 h-4 ${sevColor.text}`} />
                    ) : (
                      <Shield className={`w-4 h-4 ${sevColor.text}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold uppercase ${sevColor.text}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-500">&middot;</span>
                      <span className="text-xs text-slate-400">
                        {formatAlertType(alert.alertType)}
                      </span>
                      <span className="text-xs text-slate-500">&middot;</span>
                      <span className="text-xs text-slate-400">{alert.zoneName}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {alert.acknowledged ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-medium">ACK</span>
                    </div>
                  ) : (
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>

              {/* Escalation chain for critical */}
              {alert.severity === 'critical' && !alert.acknowledged && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Escalation Chain</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-300">
                      Immediate: SMS + Push
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300">
                      15min: Email + Call
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300">
                      30min: Insurance Provider
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Settings Tab ----

const SettingsTab: React.FC = () => {
  const optimal = getOptimalConditions();

  return (
    <div className="space-y-6">
      {/* Threshold Configuration */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          Threshold Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">Temperature</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Low Alert</span>
                <span className="text-xs font-bold text-blue-400">&lt; {optimal.temperature.min}{optimal.temperature.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">High Alert</span>
                <span className="text-xs font-bold text-red-400">&gt; {optimal.temperature.max}{optimal.temperature.unit}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 relative overflow-hidden">
                <div className="absolute inset-y-0 bg-emerald-500/40 rounded-full" style={{ left: '35%', right: '28%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50&deg;F</span>
                <span className="text-emerald-400">{optimal.temperature.min}-{optimal.temperature.max}&deg;F</span>
                <span>90&deg;F</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Humidity</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Low Alert</span>
                <span className="text-xs font-bold text-blue-400">&lt; {optimal.humidity.min}{optimal.humidity.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">High Alert</span>
                <span className="text-xs font-bold text-red-400">&gt; {optimal.humidity.max}{optimal.humidity.unit}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 relative overflow-hidden">
                <div className="absolute inset-y-0 bg-emerald-500/40 rounded-full" style={{ left: '35%', right: '35%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>20%</span>
                <span className="text-emerald-400">{optimal.humidity.min}-{optimal.humidity.max}%</span>
                <span>80%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">UV Exposure</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Max Allowed</span>
                <span className="text-xs font-bold text-red-400">&gt; {optimal.uvIndex.max} UV</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-emerald-500/40 rounded-full" style={{ width: '40%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0</span>
                <span className="text-emerald-400">Safe: 0-{optimal.uvIndex.max}</span>
                <span>5.0</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Vibration</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Max Allowed</span>
                <span className="text-xs font-bold text-red-400">&gt; {optimal.vibration.max}{optimal.vibration.unit}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-emerald-500/40 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0g</span>
                <span className="text-emerald-400">Safe: 0-{optimal.vibration.max}g</span>
                <span>2.0g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          Notification Preferences
        </h4>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl divide-y divide-slate-700/50">
          {[
            { label: 'Critical Alerts', desc: 'SMS, Push, Email immediately', enabled: true },
            { label: 'Warning Alerts', desc: 'Push notification within 5 min', enabled: true },
            { label: 'Info Alerts', desc: 'Email digest every 4 hours', enabled: true },
            { label: 'Device Offline', desc: 'SMS + Push after 30 min offline', enabled: true },
            { label: 'Daily Summary', desc: 'Email report at 8:00 AM', enabled: false },
            { label: 'Weekly Trend Report', desc: 'Comprehensive analysis every Monday', enabled: false },
          ].map((pref, idx) => (
            <div key={idx} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-white font-medium">{pref.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{pref.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                pref.enabled ? 'bg-emerald-500' : 'bg-slate-600'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  pref.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimal Condition Reference Chart */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Optimal Condition Reference
        </h4>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Metric</th>
                <th className="px-4 py-3 text-xs font-semibold text-emerald-400 uppercase">Safe Range</th>
                <th className="px-4 py-3 text-xs font-semibold text-amber-400 uppercase">Caution</th>
                <th className="px-4 py-3 text-xs font-semibold text-red-400 uppercase">Danger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr>
                <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Temperature
                </td>
                <td className="px-4 py-3 text-sm text-emerald-400">65-72&deg;F</td>
                <td className="px-4 py-3 text-sm text-amber-400">60-65 / 72-78&deg;F</td>
                <td className="px-4 py-3 text-sm text-red-400">&lt;60 / &gt;78&deg;F</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
                </td>
                <td className="px-4 py-3 text-sm text-emerald-400">45-55%</td>
                <td className="px-4 py-3 text-sm text-amber-400">35-45 / 55-65%</td>
                <td className="px-4 py-3 text-sm text-red-400">&lt;35 / &gt;65%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> UV Index
                </td>
                <td className="px-4 py-3 text-sm text-emerald-400">0-2.0</td>
                <td className="px-4 py-3 text-sm text-amber-400">2.0-3.5</td>
                <td className="px-4 py-3 text-sm text-red-400">&gt;3.5</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-white flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Vibration
                </td>
                <td className="px-4 py-3 text-sm text-emerald-400">0-0.5g</td>
                <td className="px-4 py-3 text-sm text-amber-400">0.5-1.0g</td>
                <td className="px-4 py-3 text-sm text-red-400">&gt;1.0g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

const IotConditionGuardianModal: React.FC<IotConditionGuardianModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('zones');

  const devices = useMemo(() => getSensorDevices(), []);
  const readings = useMemo(() => getSensorReadings(), []);
  const zones = useMemo(() => getEnvironmentZones(), []);
  const alerts = useMemo(() => getConditionAlerts(), []);
  const stats = useMemo(() => getGuardianStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-slate-900 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Thermometer className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Environmental IoT Guardian</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Smart sensor monitoring for card storage protection
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
            {[
              { label: 'Sensors', value: `${stats.onlineSensors}/${stats.totalSensors}`, color: 'text-emerald-400' },
              { label: 'Online', value: `${Math.round((stats.onlineSensors / stats.totalSensors) * 100)}%`, color: 'text-emerald-400' },
              { label: 'Zones', value: stats.totalZones, color: 'text-blue-400' },
              { label: 'Alerts', value: stats.activeAlerts, color: stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Health', value: `${stats.avgHealthScore}%`, color: stats.avgHealthScore >= 80 ? 'text-emerald-400' : 'text-amber-400' },
              { label: 'Protected', value: stats.cardsProtected.toLocaleString(), color: 'text-emerald-400' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50">
          {tabDefs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'zones' && <ZoneOverviewTab zones={zones} readings={readings} />}
          {activeTab === 'sensors' && <SensorsTab devices={devices} readings={readings} />}
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default IotConditionGuardianModal;
