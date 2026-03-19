import React, { useState, useMemo } from 'react';
import { Thermometer, Shield, AlertTriangle, Wifi } from 'lucide-react';
import {
  getGuardianStats,
  getEnvironmentZones,
  getConditionAlerts,
  getRiskColor,
  getSeverityColor,
} from '../lib/utils/iotConditionGuardianService';
import IotConditionGuardianWidget from '../components/IotConditionGuardianWidget';
import IotConditionGuardianModal from '../components/IotConditionGuardianModal';

const IotConditionGuardian: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => getGuardianStats(), []);
  const zones = useMemo(() => getEnvironmentZones(), []);
  const alerts = useMemo(() => getConditionAlerts(), []);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
  const totalValue = zones.reduce((sum, z) => sum + z.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Thermometer size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Environmental IoT Guardian</h1>
            <p className="text-sm text-slate-400">
              Smart sensor monitoring for card storage condition protection
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors"
        >
          <Thermometer size={16} />
          Full Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Sensors Online', value: `${stats.onlineSensors}/${stats.totalSensors}`, icon: <Wifi size={18} className="text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Active Alerts', value: stats.activeAlerts, icon: <AlertTriangle size={18} className={stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400'} />, color: stats.activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Avg Health', value: `${stats.avgHealthScore}%`, icon: <Shield size={18} className="text-emerald-400" />, color: stats.avgHealthScore >= 80 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Cards Protected', value: stats.cardsProtected.toLocaleString(), icon: <Shield size={18} className="text-blue-400" />, color: 'text-blue-400' },
          { label: 'Value Protected', value: `$${(totalValue / 1000).toFixed(0)}K`, icon: <Shield size={18} className="text-purple-400" />, color: 'text-purple-400' },
        ].map((card, idx) => (
          <div key={idx} className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="flex justify-center mb-2">{card.icon}</div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''} Require Attention
            </p>
            <div className="space-y-1 mt-2">
              {criticalAlerts.map(alert => (
                <p key={alert.id} className="text-xs text-red-300/80">{alert.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zone Overview + Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Zone Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map(zone => {
              const riskColor = getRiskColor(zone.riskLevel);
              return (
                <div key={zone.id} className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">{zone.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${riskColor.bg} ${riskColor.text} ${riskColor.border}`}>
                      {zone.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-12 h-12">
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
                        <span className={`text-xs font-bold ${riskColor.text}`}>{zone.healthScore}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{zone.description.slice(0, 50)}...</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {zone.cardCount} cards &middot; ${zone.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        zone.healthScore >= 80 ? 'bg-emerald-500' :
                        zone.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${zone.healthScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget */}
        <div>
          <IotConditionGuardianWidget onOpenModal={() => setIsModalOpen(true)} />
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Recent Alerts</h2>
        <div className="space-y-2">
          {alerts
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 4)
            .map(alert => {
              const sevColor = getSeverityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${sevColor.bg} ${sevColor.border} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${sevColor.text} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold uppercase ${sevColor.text}`}>{alert.severity}</span>
                    <span className="text-xs text-slate-500 ml-2">{alert.zoneName}</span>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">{alert.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal */}
      <IotConditionGuardianModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default IotConditionGuardian;
