import React, { useMemo, useState } from 'react';
import {
  X,
  Lock,
  Shield,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Flame,
  CloudRain,
  Zap,
  Package,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getStorageUnits,
  getVaultProviders,
  getEnvironmentalAlerts,
  getDisasterPlans,
  getVaultStats,
  getEnvironmentalHistory,
  getStorageRecommendation,
  StorageUnit,
  VaultProvider,
  EnvironmentalAlert,
  DisasterPlan,
  VaultStats,
} from '../lib/utils/vaultSecurityService';

interface VaultSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'my_storage' | 'providers' | 'environment' | 'disaster_plan';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'my_storage', label: 'My Storage', icon: <Lock size={16} /> },
  { id: 'providers', label: 'Providers', icon: <Package size={16} /> },
  { id: 'environment', label: 'Environment', icon: <Thermometer size={16} /> },
  { id: 'disaster_plan', label: 'Disaster Plan', icon: <Shield size={16} /> },
];

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function statusBadge(status: 'optimal' | 'warning' | 'critical'): string {
  const map = {
    optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return map[status];
}

function severityBadge(severity: 'info' | 'warning' | 'critical'): string {
  const map = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return map[severity];
}

function typeLabel(type: StorageUnit['type']): string {
  const map = {
    home_safe: 'Home Safe',
    bank_safe_deposit: 'Bank Safe Deposit',
    third_party_vault: 'Third-Party Vault',
    climate_controlled: 'Climate Controlled',
    standard_storage: 'Standard Storage',
  };
  return map[type];
}

function disasterIcon(type: DisasterPlan['type']): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    fire: <Flame size={16} className="text-red-400" />,
    flood: <CloudRain size={16} className="text-blue-400" />,
    theft: <Lock size={16} className="text-amber-400" />,
    earthquake: <AlertTriangle size={16} className="text-orange-400" />,
    power_outage: <Zap size={16} className="text-yellow-400" />,
  };
  return map[type] ?? <Shield size={16} className="text-slate-400" />;
}

function disasterLabel(type: DisasterPlan['type']): string {
  const map: Record<string, string> = {
    fire: 'Fire',
    flood: 'Flood',
    theft: 'Theft',
    earthquake: 'Earthquake',
    power_outage: 'Power Outage',
  };
  return map[type] ?? type;
}

// ---- Tab Components ----

const MyStorageTab: React.FC<{ units: StorageUnit[]; stats: VaultStats }> = ({ units, stats }) => {
  const recommendation = useMemo(() => getStorageRecommendation(350000), []);

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Cards</p>
          <p className="text-2xl font-bebas text-white">{stats.totalUsed}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Capacity</p>
          <p className="text-2xl font-bebas text-white">{Math.round((stats.totalUsed / stats.totalCapacity) * 100)}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Insured</p>
          <p className="text-2xl font-bebas text-emerald-400">{fmt(stats.totalInsured)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Gap</p>
          <p className={`text-2xl font-bebas ${stats.insuranceGaps > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stats.insuranceGaps > 0 ? fmt(stats.insuranceGaps) : '$0'}
          </p>
        </div>
      </div>

      {/* Storage Units */}
      {units.map(unit => {
        const usagePct = Math.round((unit.used / unit.capacity) * 100);
        return (
          <div key={unit.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{unit.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-700 font-bold uppercase tracking-wider">
                    {typeLabel(unit.type)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={10} /> {unit.location}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                unit.securityLevel === 'institutional' ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20' :
                unit.securityLevel === 'maximum' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                unit.securityLevel === 'enhanced' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-slate-700/50 text-slate-400 border-slate-700'
              }`}>
                <Shield size={10} /> {unit.securityLevel}
              </span>
            </div>

            {/* Capacity + Environment Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Capacity */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Capacity</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bebas text-white">{unit.used}</span>
                  <span className="text-xs text-slate-500">/ {unit.capacity}</span>
                  <span className="text-xs text-slate-400 ml-auto">{usagePct}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-brand-lime'}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>

              {/* Temperature Gauge */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Temperature</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusBadge(unit.temperature.status)}`}>
                    {unit.temperature.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <Thermometer size={14} className={
                    unit.temperature.status === 'optimal' ? 'text-emerald-400' :
                    unit.temperature.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                  } />
                  <span className="text-xl font-bebas text-white">{unit.temperature.current}°F</span>
                  <span className="text-xs text-slate-500">optimal: {unit.temperature.optimal}°F</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${
                      unit.temperature.status === 'optimal' ? 'bg-emerald-500' :
                      unit.temperature.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (unit.temperature.current / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Humidity Gauge */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Humidity</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusBadge(unit.humidity.status)}`}>
                    {unit.humidity.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <Droplets size={14} className={
                    unit.humidity.status === 'optimal' ? 'text-emerald-400' :
                    unit.humidity.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                  } />
                  <span className="text-xl font-bebas text-white">{unit.humidity.current}%</span>
                  <span className="text-xs text-slate-500">optimal: {unit.humidity.optimal}%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      unit.humidity.status === 'optimal' ? 'bg-emerald-500' :
                      unit.humidity.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${unit.humidity.current}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card Count + Insurance + Fee */}
            <div className="flex items-center gap-6 text-xs text-slate-400 pt-3 border-t border-slate-700/30">
              <span><span className="text-white font-bold">{unit.cards.length}</span> tracked cards</span>
              <span>Insurance: <span className="text-emerald-400 font-bold">{fmt(unit.insuranceCoverage)}</span></span>
              {unit.monthlyFee > 0 && (
                <span>Fee: <span className="text-white font-bold">{fmt(unit.monthlyFee)}/mo</span></span>
              )}
            </div>
          </div>
        );
      })}

      {/* Recommendation */}
      <div className="bg-brand-lime/5 border border-brand-lime/20 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-brand-lime mb-2 flex items-center gap-2">
          <Shield size={14} /> Storage Recommendation — {recommendation.tier} Tier
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">{recommendation.recommendation}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span>Provider: <span className="text-white font-medium">{recommendation.provider}</span></span>
          <span>Budget: <span className="text-brand-lime font-bold">{recommendation.monthlyBudget}</span></span>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendation.features.map((f, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] bg-brand-lime/10 text-brand-lime px-2 py-1 rounded-lg border border-brand-lime/20 font-medium">
              <CheckCircle2 size={10} /> {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProvidersTab: React.FC<{ providers: VaultProvider[] }> = ({ providers }) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 leading-relaxed mb-2">
        Compare vault and storage providers by pricing, insurance coverage, security features, and climate control.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 text-slate-400 font-medium">Provider</th>
              <th className="text-left py-3 text-slate-400 font-medium">Type</th>
              <th className="text-right py-3 text-slate-400 font-medium">Monthly</th>
              <th className="text-right py-3 text-slate-400 font-medium">Annual</th>
              <th className="text-right py-3 text-slate-400 font-medium">Per Card</th>
              <th className="text-center py-3 text-slate-400 font-medium">Insurance</th>
              <th className="text-center py-3 text-slate-400 font-medium">Climate</th>
              <th className="text-center py-3 text-slate-400 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 text-white font-medium">{p.name}</td>
                <td className="py-3 text-slate-400">{p.type}</td>
                <td className="py-3 text-right text-white font-mono">{p.pricing.monthly > 0 ? fmt(p.pricing.monthly) : 'Free'}</td>
                <td className="py-3 text-right text-slate-300 font-mono">{p.pricing.annual > 0 ? fmt(p.pricing.annual) : '—'}</td>
                <td className="py-3 text-right text-slate-300 font-mono">{p.pricing.perCard > 0 ? `$${p.pricing.perCard.toFixed(2)}` : '—'}</td>
                <td className="py-3 text-center">
                  {p.insurance.included ? (
                    <span className="text-emerald-400 font-bold">{fmt(p.insurance.maxCoverage)}</span>
                  ) : (
                    <span className="text-red-400">None</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {p.climateControlled ? (
                    <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                  ) : (
                    <X size={14} className="text-red-400 mx-auto" />
                  )}
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-white font-bold">{p.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provider Detail Cards */}
      {providers.map(p => (
        <div key={p.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-white">{p.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{p.type}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-white">{p.rating}</span>
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <MapPin size={12} className="text-slate-500" />
            {p.locations.map((loc, i) => (
              <span key={i} className="text-[10px] bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                {loc}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {p.features.map((f, i) => (
              <span key={i} className="text-[10px] bg-brand-lime/5 text-brand-lime px-2 py-0.5 rounded-md border border-brand-lime/10 font-medium">
                {f}
              </span>
            ))}
          </div>

          {/* Security Features */}
          <div className="flex flex-wrap gap-1.5">
            {p.securityFeatures.map((f, i) => (
              <span key={i} className="text-[10px] bg-slate-900/50 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                <Shield size={8} /> {f}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const EnvironmentTab: React.FC<{ alerts: EnvironmentalAlert[] }> = ({ alerts }) => {
  const history = useMemo(() => getEnvironmentalHistory(), []);
  const units = useMemo(() => getStorageUnits(), []);

  const unitNames: Record<string, string> = {};
  units.forEach(u => { unitNames[u.id] = u.name; });

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" /> Active Environmental Alerts
        </h3>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-2xl p-5 ${
                alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                alert.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-blue-500/5 border-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${severityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    {alert.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={12} />
                  <span className="font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-white font-medium mb-1">
                {unitNames[alert.unit] ?? alert.unit}
              </p>
              <div className="flex gap-4 text-xs text-slate-400 mb-3">
                <span>Current: <span className="text-white font-bold">{alert.current}{alert.type === 'temperature' ? '°F' : alert.type === 'humidity' ? '%' : ''}</span></span>
                <span>Optimal: <span className="text-emerald-400 font-bold">{alert.optimal}{alert.type === 'temperature' ? '°F' : alert.type === 'humidity' ? '%' : ''}</span></span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{alert.recommendation}</p>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-400">All Clear</p>
              <p className="text-xs text-slate-500 mt-1">No environmental alerts at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* Temperature History Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Thermometer size={14} className="text-brand-lime" /> Temperature — 30-Day History
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 80]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°F`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="temp1" name="PWCC Vault" stroke="#a3e635" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temp2" name="Home Safe" stroke="#fbbf24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temp3" name="Bank Deposit" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Humidity History Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Droplets size={14} className="text-blue-400" /> Humidity — 30-Day History
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 75]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="hum1" name="PWCC Vault" stroke="#a3e635" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hum2" name="Home Safe" stroke="#fbbf24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hum3" name="Bank Deposit" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const DisasterPlanTab: React.FC<{ plans: DisasterPlan[] }> = ({ plans }) => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0]?.id ?? null);

  const totalInsurance = plans.reduce((s, p) => s + p.insuranceCoverage, 0);
  const allPrepped = plans.every(p => p.preparations.length >= 4);

  return (
    <div className="space-y-6">
      {/* Preparedness Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Scenarios Covered</p>
          <p className="text-2xl font-bebas text-white">{plans.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Insurance</p>
          <p className="text-2xl font-bebas text-emerald-400">{fmt(totalInsurance)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Readiness</p>
          <p className={`text-2xl font-bebas ${allPrepped ? 'text-emerald-400' : 'text-amber-400'}`}>
            {allPrepped ? 'Prepared' : 'Review Needed'}
          </p>
        </div>
      </div>

      {/* Disaster Plans */}
      {plans.map(plan => {
        const isExpanded = expandedPlan === plan.id;
        return (
          <div key={plan.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                {disasterIcon(plan.type)}
                <div>
                  <h4 className="text-sm font-bold text-white">{disasterLabel(plan.type)} Plan</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Last reviewed: {plan.lastReviewed} — Recovery: {plan.estimatedRecoveryTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-bold">{fmt(plan.insuranceCoverage)} coverage</span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 space-y-4 border-t border-slate-700/30 pt-4">
                {/* Preparations */}
                <div>
                  <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <Shield size={12} className="text-brand-lime" /> Preparations Checklist
                  </h5>
                  <ul className="space-y-2">
                    {plan.preparations.map((prep, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{prep}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recovery Steps */}
                <div>
                  <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <Clock size={12} className="text-amber-400" /> Recovery Steps
                  </h5>
                  <ol className="space-y-2">
                    {plan.recoverySteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-slate-700 rounded-full text-[10px] font-bold text-slate-300">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Insurance + Recovery Time */}
                <div className="flex gap-4 pt-3 border-t border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} className="text-emerald-400" />
                    <span className="text-xs text-slate-400">Coverage: <span className="text-emerald-400 font-bold">{plan.insuranceCoverage > 0 ? fmt(plan.insuranceCoverage) : 'Not covered'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Est. Recovery: <span className="text-white font-bold">{plan.estimatedRecoveryTime}</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Main Modal ----

export const VaultSecurityModal: React.FC<VaultSecurityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('my_storage');
  const units = useMemo(() => getStorageUnits(), []);
  const providers = useMemo(() => getVaultProviders(), []);
  const alerts = useMemo(() => getEnvironmentalAlerts(), []);
  const plans = useMemo(() => getDisasterPlans(), []);
  const stats = useMemo(() => getVaultStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl mx-4 mt-8 mb-8 max-h-[90vh] flex flex-col bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Vault Security & Storage Intelligence</h2>
              <p className="text-xs text-slate-400 mt-0.5">Physical Collection Protection — Environmental Monitoring & Disaster Planning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 bg-slate-900/30 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-brand-lime" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Units</p>
              <p className="text-sm font-bold text-white">{stats.totalUnits} storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer size={14} className="text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Avg Temp</p>
              <p className="text-sm font-bold text-white">{stats.avgTemperature}°F</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Alerts</p>
              <p className="text-sm font-bold text-amber-400">{stats.alertCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Insured</p>
              <p className="text-sm font-bold text-emerald-400">{fmt(stats.totalInsured)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'my_storage' && <MyStorageTab units={units} stats={stats} />}
          {activeTab === 'providers' && <ProvidersTab providers={providers} />}
          {activeTab === 'environment' && <EnvironmentTab alerts={alerts} />}
          {activeTab === 'disaster_plan' && <DisasterPlanTab plans={plans} />}
        </div>
      </div>
    </div>
  );
};

export default VaultSecurityModal;
