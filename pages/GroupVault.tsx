import React, { useState, useEffect } from 'react';
import {
  Lock, Users, Package, DollarSign, ShieldCheck, Thermometer,
  Droplets, Sun, AlertTriangle, CheckCircle, Eye, ArrowDownToLine,
  ArrowUpFromLine, KeyRound, Clock, MapPin, Activity, BarChart3,
} from 'lucide-react';
import {
  getGroupVaults,
  getGroupVaultStats,
  getVaultTierColor,
  getConditionColor,
  getAccessLevelColor,
  type GroupVault as GroupVaultType,
  type GroupVaultStats,
  type VaultTier,
  type AccessLevel,
  type StorageCondition,
} from '../lib/groupVaultService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${n.toLocaleString()}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

const tierLabel = (t: VaultTier) =>
  t === 'ultra-secure' ? 'Ultra-Secure' : t === 'premium' ? 'Premium' : 'Standard';

const tierBadgeBg = (t: VaultTier) =>
  t === 'ultra-secure'
    ? 'bg-purple-500/20 border-purple-500/30'
    : t === 'premium'
      ? 'bg-amber-500/20 border-amber-500/30'
      : 'bg-blue-500/20 border-blue-500/30';

const accessIcon = (level: AccessLevel) => {
  switch (level) {
    case 'full':
      return <KeyRound size={14} />;
    case 'withdraw':
      return <ArrowUpFromLine size={14} />;
    case 'deposit':
      return <ArrowDownToLine size={14} />;
    case 'view-only':
      return <Eye size={14} />;
  }
};

const conditionBadgeBg = (c: StorageCondition) =>
  c === 'optimal'
    ? 'bg-emerald-500/20'
    : c === 'acceptable'
      ? 'bg-yellow-500/20'
      : c === 'warning'
        ? 'bg-orange-500/20'
        : 'bg-red-500/20';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GroupVault: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<GroupVaultType[]>([]);
  const [stats, setStats] = useState<GroupVaultStats | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    try {
      setVaults(getGroupVaults());
      setStats(getGroupVaultStats());
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const vault = vaults[selectedIdx];
  if (!vault || !stats) return null;

  const envColor = getConditionColor(vault.environment.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Lock size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Group Vault & Shared Storage</h1>
            <p className="text-slate-400 text-sm">
              Co-located secure storage with fractional access, shared costs & climate monitoring
            </p>
          </div>
        </div>

        {/* ---- Stats Row ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Value Protected',
              value: fmtFull(stats.totalValueProtected),
              icon: <DollarSign size={18} className="text-emerald-400" />,
              sub: `${stats.totalItemsStored} items across ${stats.totalVaults} vaults`,
            },
            {
              label: 'Active Members',
              value: stats.totalMembers,
              icon: <Users size={18} className="text-blue-400" />,
              sub: `${stats.totalVaults} vault groups`,
            },
            {
              label: 'Avg Cost Savings',
              value: `${stats.avgSavingsPercent}%`,
              icon: <BarChart3 size={18} className="text-amber-400" />,
              sub: 'vs individual vault rates',
            },
            {
              label: 'Platform Uptime',
              value: `${stats.uptime}%`,
              icon: <Activity size={18} className="text-purple-400" />,
              sub: `${stats.securityIncidents} security incidents`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-medium">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-slate-500 text-xs mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ---- Vault Selector Tabs ---- */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {vaults.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                i === selectedIdx
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock size={14} />
                <span>{v.name}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${tierBadgeBg(v.tier)} ${getVaultTierColor(v.tier)}`}
                >
                  {tierLabel(v.tier)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ---- Vault Header ---- */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold">{vault.name}</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${tierBadgeBg(vault.tier)} ${getVaultTierColor(vault.tier)}`}
                >
                  {tierLabel(vault.tier)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {vault.facility}
                </span>
                <span>
                  {vault.city}, {vault.state}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-slate-400 text-xs">Members</div>
                <div className="font-bold">
                  {vault.memberCount}/{vault.maxMembers}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs">Items</div>
                <div className="font-bold">{vault.totalItems}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs">Total Value</div>
                <div className="font-bold text-emerald-400">{fmtFull(vault.totalValue)}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs">Last Audit</div>
                <div className="font-bold">{vault.lastAudit}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Main Grid ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Members */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users size={16} className="text-blue-400" /> Member Access Levels
            </h3>
            <div className="space-y-3">
              {vault.members.map((m) => (
                <div
                  key={m.userId}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{m.handle}</span>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${getAccessLevelColor(m.accessLevel)}`}
                    >
                      {accessIcon(m.accessLevel)} {m.accessLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="block text-slate-500">Items</span>
                      <span className="text-white font-medium">{m.itemsStored}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Value</span>
                      <span className="text-white font-medium">{fmt(m.valueStored)}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Monthly</span>
                      <span className="text-white font-medium">${m.monthlyShare}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Last: {m.lastAccess}
                    </span>
                    <span>
                      {m.depositCount}D / {m.withdrawCount}W
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Stored Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package size={16} className="text-amber-400" /> Stored Items Inventory
            </h3>
            <div className="space-y-3">
              {vault.recentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" title={item.cardName}>
                        {item.cardName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.grade ?? 'Ungraded'} &middot; {item.ownerHandle}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-emerald-400 ml-2 flex-shrink-0">
                      {fmtFull(item.estimatedValue)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {item.location}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${conditionBadgeBg(item.condition)} ${getConditionColor(item.condition)}`}
                    >
                      {item.condition}
                    </span>
                    {item.insured ? (
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <ShieldCheck size={11} /> Insured
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <AlertTriangle size={11} /> Uninsured
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Environment + Cost + Security */}
          <div className="space-y-6">
            {/* Environment */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Thermometer size={16} className="text-cyan-400" /> Environment Monitoring
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${conditionBadgeBg(vault.environment.status)} ${envColor}`}
                >
                  <CheckCircle size={12} /> {vault.environment.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">
                  Updated {new Date(vault.environment.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <Thermometer size={18} className="mx-auto text-cyan-400 mb-1" />
                  <div className="text-lg font-bold">{vault.environment.temperature}°F</div>
                  <div className="text-xs text-slate-400">Temperature</div>
                  <div className="text-xs text-emerald-400 mt-0.5">Target: 65-72°F</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <Droplets size={18} className="mx-auto text-blue-400 mb-1" />
                  <div className="text-lg font-bold">{vault.environment.humidity}%</div>
                  <div className="text-xs text-slate-400">Humidity</div>
                  <div className="text-xs text-emerald-400 mt-0.5">Target: 35-45%</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <Sun size={18} className="mx-auto text-yellow-400 mb-1" />
                  <div className="text-lg font-bold">{vault.environment.uvIndex}</div>
                  <div className="text-xs text-slate-400">UV Index</div>
                  <div className="text-xs text-emerald-400 mt-0.5">Target: 0.0</div>
                </div>
              </div>
              {vault.environment.alerts.length > 0 && (
                <div className="space-y-2 mt-2">
                  {vault.environment.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 text-xs text-yellow-300"
                    >
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Comparison */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" /> Cost Comparison
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Individual vault rate</span>
                  <span className="text-slate-300 font-medium">
                    ${vault.individualEquivalent}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Group rate (per member)</span>
                  <span className="text-emerald-400 font-bold">${vault.costPerMember}/mo</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Your monthly savings</span>
                  <span className="text-emerald-400 font-bold">
                    ${(vault.individualEquivalent - vault.costPerMember).toFixed(2)}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Savings percentage</span>
                  <span className="text-emerald-400 font-bold">{vault.savingsPercent}%</span>
                </div>
                {/* Visual bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Individual</span>
                    <span>Group</span>
                  </div>
                  <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-slate-600 rounded-full flex items-center justify-end pr-2 text-xs font-medium"
                      style={{ width: '100%' }}
                    >
                      ${vault.individualEquivalent}
                    </div>
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500/80 rounded-full flex items-center justify-end pr-2 text-xs font-bold"
                      style={{
                        width: `${(vault.costPerMember / vault.individualEquivalent) * 100}%`,
                      }}
                    >
                      ${vault.costPerMember}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Base facility cost: ${vault.monthlyBaseCost}/mo split among{' '}
                  {vault.memberCount} members
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-400" /> Security Features
              </h3>
              <div className="space-y-2">
                {vault.securityFeatures.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
              {vault.insurance && (
                <div className="flex items-center gap-2 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-xs text-emerald-300">
                  <ShieldCheck size={14} />
                  Full replacement value insurance active &mdash; all insured items covered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupVault;
