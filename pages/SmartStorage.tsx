// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Thermometer, Droplets, AlertTriangle, Shield, Wrench, DollarSign, Activity, Archive } from 'lucide-react';
import {
  getStorageZones,
  getSensorReadings,
  getEnvironmentalAlerts,
  getStorageUnits,
  getConditionScores,
  getDamageRiskAssessment,
  getInsuranceRequirements,
  getMaintenanceTasks,
  getStorageAnalytics,
  getStorageCosts,
  getOptimalConditions,
  getStatusConfig,
  getProtectionConfig,
  getSeverityConfig,
  getAlertConfig,
  formatCurrency,
  type StorageZone,
  type SensorReading,
  type EnvironmentalAlert,
  type StorageUnit,
  type ConditionScore,
  type DamageRisk,
  type InsuranceRequirement,
  type MaintenanceTask,
  type StorageAnalytics,
  type StorageCost,
} from '../lib/utils/smartStorageService';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const SmartStorage: React.FC = () => {
  const [zones, setZones] = useState<StorageZone[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [units, setUnits] = useState<StorageUnit[]>([]);
  const [scores, setScores] = useState<ConditionScore[]>([]);
  const [risks, setRisks] = useState<DamageRisk[]>([]);
  const [insurance, setInsurance] = useState<InsuranceRequirement[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);
  const [costs, setCosts] = useState<StorageCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setZones(getStorageZones());
      setReadings(getSensorReadings());
      setAlerts(getEnvironmentalAlerts());
      setUnits(getStorageUnits());
      setScores(getConditionScores());
      setRisks(getDamageRiskAssessment());
      setInsurance(getInsuranceRequirements());
      setTasks(getMaintenanceTasks());
      setAnalytics(getStorageAnalytics());
      setCosts(getStorageCosts());
      setLoading(false);
    } catch {
      setError('Failed to load Smart Storage data');
      setLoading(false);
    }
  }, []);

  const optimalConditions = useMemo(() => getOptimalConditions(), []);

  const tempChartData = useMemo(() => {
    if (readings.length === 0) return [];
    const hourMap = new Map<number, Record<string, number>>();

    readings.forEach(r => {
      const hour = new Date(r.timestamp).getHours();
      const zone = zones.find(z => z.id === r.zoneId);
      if (!zone) return;
      if (!hourMap.has(hour)) hourMap.set(hour, { hour });
      const entry = hourMap.get(hour)!;
      entry[zone.name] = r.temperature;
    });

    return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
  }, [readings, zones]);

  const humidityChartData = useMemo(() => {
    if (readings.length === 0) return [];
    const hourMap = new Map<number, Record<string, number>>();

    readings.forEach(r => {
      const hour = new Date(r.timestamp).getHours();
      const zone = zones.find(z => z.id === r.zoneId);
      if (!zone) return;
      if (!hourMap.has(hour)) hourMap.set(hour, { hour });
      const entry = hourMap.get(hour)!;
      entry[zone.name] = r.humidity;
    });

    return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
  }, [readings, zones]);

  const costChartData = useMemo(() => {
    return costs.map(c => ({
      zone: c.zoneName,
      rent: c.monthlyRent,
      electricity: c.electricityCost,
      insurance: c.insuranceCost,
      maintenance: c.maintenanceCost,
    }));
  }, [costs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Smart Storage &amp; Environmental IoT Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <Thermometer size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Smart Storage &amp; Environmental IoT Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time environmental monitoring, damage prevention &amp; storage optimization &mdash; Phase 142</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Zones</p>
          <p className="text-2xl font-bold text-blue-400">{analytics.totalZones}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cards</p>
          <p className="text-2xl font-bold text-emerald-400">{analytics.totalCards.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(analytics.totalValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condition</p>
          <p className={`text-2xl font-bold ${analytics.avgConditionScore >= 80 ? 'text-emerald-400' : analytics.avgConditionScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{analytics.avgConditionScore}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Alerts</p>
          <p className={`text-2xl font-bold ${analytics.activeAlerts > 3 ? 'text-red-400' : analytics.activeAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{analytics.activeAlerts}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly Cost</p>
          <p className="text-2xl font-bold text-purple-400">${analytics.monthlyStorageCost}</p>
        </div>
      </div>

      {/* Zone Overview Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Archive size={18} className="text-cyan-400" />
          Storage Zone Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map(zone => {
            const statusCfg = getStatusConfig(zone.status);
            const protCfg = getProtectionConfig(zone.protectionLevel);
            const score = scores.find(s => s.zoneId === zone.id);
            return (
              <div key={zone.id} className={`bg-slate-900/50 border rounded-xl p-4 ${statusCfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white truncate mr-2">{zone.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{zone.description}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Cards</span><span className="text-slate-300">{zone.cardCount}</span></div>
                  <div className="flex justify-between"><span>Value</span><span className="text-emerald-400">{formatCurrency(zone.totalValue)}</span></div>
                  <div className="flex justify-between"><span>Protection</span><span className={protCfg.text}>{protCfg.label}</span></div>
                  <div className="flex justify-between"><span>Target</span><span className="text-slate-300">{zone.targetTemp}°F / {zone.targetHumidity}%</span></div>
                  {score && (
                    <div className="flex justify-between">
                      <span>Score</span>
                      <span className={`font-bold ${score.overall >= 80 ? 'text-emerald-400' : score.overall >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{score.overall}/100</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Temperature + Humidity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Line Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Thermometer size={18} className="text-orange-400" />
            Temperature (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}:00`} />
                <YAxis domain={[60, 85]} tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: '°F', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} labelFormatter={(v: number) => `${v}:00`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Main Vault" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Display Case" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Graded Slab Shelf" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Raw Card Cabinet" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Overflow Storage" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Area Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-blue-400" />
            Humidity Levels (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}:00`} />
                <YAxis domain={[30, 75]} tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} labelFormatter={(v: number) => `${v}:00`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Main Vault" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Display Case" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Overflow Storage" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Environmental Alerts */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          Environmental Alerts ({alerts.filter(a => !a.acknowledged).length} active)
        </h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 };
            return order[a.severity] - order[b.severity];
          }).map(alert => {
            const sevCfg = getSeverityConfig(alert.severity);
            const typeCfg = getAlertConfig(alert.type);
            return (
              <div key={alert.id} className={`bg-slate-900/50 border rounded-xl p-4 ${alert.acknowledged ? 'border-slate-700/30 opacity-60' : sevCfg.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sevCfg.bg} ${sevCfg.text}`}>{sevCfg.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.text}`}>{typeCfg.label}</span>
                  <span className="text-[10px] text-slate-500">{alert.zoneName}</span>
                  {alert.acknowledged && <span className="text-[10px] text-slate-600 ml-auto">Acknowledged</span>}
                </div>
                <p className="text-xs text-slate-300 mb-1">{alert.message}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-1">
                  <span>Reading: <span className="text-slate-300">{alert.reading}</span></span>
                  <span>Threshold: <span className="text-slate-300">{alert.threshold}</span></span>
                </div>
                <p className="text-[10px] text-emerald-400/70 italic">{alert.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Unit Inventory + Condition Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Unit Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Archive size={18} className="text-blue-400" />
            Storage Unit Inventory
          </h2>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Unit</th>
                  <th className="text-left py-2 px-2">Zone</th>
                  <th className="text-right py-2 px-2">Cards</th>
                  <th className="text-right py-2 px-2">Value</th>
                  <th className="text-right py-2 pl-2">Protection</th>
                </tr>
              </thead>
              <tbody>
                {units.sort((a, b) => b.totalValue - a.totalValue).map(unit => {
                  const protCfg = getProtectionConfig(unit.protectionLevel);
                  return (
                    <tr key={unit.id} className="border-b border-slate-700/30">
                      <td className="py-2 pr-2 text-slate-300 font-medium">{unit.name}</td>
                      <td className="py-2 px-2 text-slate-400">{unit.zoneName}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{unit.cardCount}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-bold">{formatCurrency(unit.totalValue)}</td>
                      <td className={`py-2 pl-2 text-right ${protCfg.text}`}>{protCfg.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Condition Score Cards */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            Condition Scores by Zone
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {scores.sort((a, b) => b.overall - a.overall).map(score => (
              <div key={score.zoneId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{score.zoneName}</span>
                  <span className={`text-sm font-bold ${score.overall >= 80 ? 'text-emerald-400' : score.overall >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{score.overall}/100</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Temperature', value: score.temperature, color: 'bg-orange-400' },
                    { label: 'Humidity', value: score.humidity, color: 'bg-blue-400' },
                    { label: 'UV Protection', value: score.uvProtection, color: 'bg-amber-400' },
                    { label: 'Vibration', value: score.vibrationControl, color: 'bg-purple-400' },
                  ].map(metric => (
                    <div key={metric.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-20">{metric.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 w-8 text-right">{metric.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end mt-1">
                  <span className={`text-[9px] ${score.trend === 'improving' ? 'text-emerald-400' : score.trend === 'declining' ? 'text-red-400' : 'text-slate-500'}`}>
                    {score.trend === 'improving' ? 'Improving' : score.trend === 'declining' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Damage Risk Assessment */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-400" />
          Damage Risk Assessment
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Zone</th>
                <th className="text-center py-2 px-2">Risk Level</th>
                <th className="text-right py-2 px-2">Score</th>
                <th className="text-left py-2 px-2">Primary Factor</th>
                <th className="text-right py-2 px-2">Est. Loss</th>
                <th className="text-right py-2 pl-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {risks.sort((a, b) => b.riskScore - a.riskScore).map(risk => (
                <tr key={risk.zoneId} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2 text-slate-300 font-medium">{risk.zoneName}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      risk.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      risk.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      risk.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>{risk.riskLevel}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{risk.riskScore}</td>
                  <td className="py-2 px-2 text-slate-400">{risk.primaryFactor}</td>
                  <td className="py-2 px-2 text-right text-red-400">{formatCurrency(risk.estimatedLoss)}</td>
                  <td className="py-2 pl-2 text-right text-slate-400">{risk.timeToAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Cost Breakdown + Optimal Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-green-400" />
            Monthly Storage Cost Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
                <YAxis type="category" dataKey="zone" tick={{ fontSize: 9, fill: '#64748b' }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => `$${v}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="rent" stackId="a" fill="#3b82f6" name="Rent" />
                <Bar dataKey="electricity" stackId="a" fill="#f59e0b" name="Electricity" />
                <Bar dataKey="insurance" stackId="a" fill="#10b981" name="Insurance" />
                <Bar dataKey="maintenance" stackId="a" fill="#a855f7" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimal vs Actual Conditions */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" />
            Optimal vs Actual Conditions
          </h2>
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Optimal Ranges</p>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Temperature</span><span className="text-emerald-400">{optimalConditions.temperature.min}-{optimalConditions.temperature.max}°F</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ideal Temp</span><span className="text-emerald-400">{optimalConditions.temperature.ideal}°F</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Humidity</span><span className="text-blue-400">{optimalConditions.humidity.min}-{optimalConditions.humidity.max}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ideal Humidity</span><span className="text-blue-400">{optimalConditions.humidity.ideal}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max UV</span><span className="text-amber-400">{optimalConditions.uvIndex.max}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max Vibration</span><span className="text-purple-400">{optimalConditions.vibration.max}g</span></div>
              </div>
            </div>
            {zones.slice(0, 4).map(zone => {
              const zoneReadings = readings.filter(r => r.zoneId === zone.id);
              const avgTemp = zoneReadings.length > 0 ? Math.round(zoneReadings.reduce((s, r) => s + r.temperature, 0) / zoneReadings.length * 10) / 10 : zone.targetTemp;
              const avgHum = zoneReadings.length > 0 ? Math.round(zoneReadings.reduce((s, r) => s + r.humidity, 0) / zoneReadings.length * 10) / 10 : zone.targetHumidity;
              const tempOk = avgTemp >= optimalConditions.temperature.min && avgTemp <= optimalConditions.temperature.max;
              const humOk = avgHum >= optimalConditions.humidity.min && avgHum <= optimalConditions.humidity.max;

              return (
                <div key={zone.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                  <p className="text-xs font-bold text-white mb-1">{zone.name}</p>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className={tempOk ? 'text-emerald-400' : 'text-amber-400'}>{avgTemp}°F {tempOk ? 'OK' : 'Off'}</span>
                    <span className={humOk ? 'text-emerald-400' : 'text-amber-400'}>{avgHum}% {humOk ? 'OK' : 'Off'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Maintenance + Insurance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Tasks */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-amber-400" />
            Maintenance Tasks ({tasks.filter(t => !t.completed).length} pending)
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.sort((a, b) => {
              const order = { urgent: 0, high: 1, medium: 2, low: 3 };
              return order[a.priority] - order[b.priority];
            }).map(task => (
              <div key={task.id} className={`bg-slate-900/50 border rounded-xl p-3 ${
                task.completed ? 'border-slate-700/30 opacity-50' :
                task.priority === 'urgent' ? 'border-red-500/30' :
                task.priority === 'high' ? 'border-amber-500/30' : 'border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{task.task}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>{task.priority}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>{task.zoneName}</span>
                  <span>Due: {task.dueDate}</span>
                  {task.estimatedCost > 0 && <span className="text-slate-400">${task.estimatedCost}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Requirements */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-purple-400" />
            Insurance Coverage ({analytics.insuranceCoverage}% covered)
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {insurance.sort((a, b) => b.gap - a.gap).map(ins => (
              <div key={ins.id} className={`bg-slate-900/50 border rounded-xl p-3 ${ins.gap > 50000 ? 'border-red-500/30' : ins.gap > 10000 ? 'border-amber-500/30' : 'border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{ins.zoneName}</span>
                  <span className="text-[10px] text-slate-400">${ins.monthlyPremium}/mo</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] mb-2">
                  <span className="text-slate-500">Required: <span className="text-slate-300">{formatCurrency(ins.requiredCoverage)}</span></span>
                  <span className="text-slate-500">Current: <span className="text-emerald-400">{formatCurrency(ins.currentCoverage)}</span></span>
                  {ins.gap > 0 && <span className="text-red-400">Gap: {formatCurrency(ins.gap)}</span>}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-full rounded-full ${ins.gap === 0 ? 'bg-emerald-500' : ins.gap > 50000 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, Math.round(ins.currentCoverage / Math.max(1, ins.requiredCoverage) * 100))}%` }}
                  />
                </div>
                {ins.recommendations.length > 0 && (
                  <p className="text-[9px] text-cyan-400/70 italic">{ins.recommendations[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartStorage;
