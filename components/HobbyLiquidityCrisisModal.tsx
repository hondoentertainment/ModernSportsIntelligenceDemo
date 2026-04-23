// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Activity,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Gauge,
  History,
  Bell,
  Target,
  Droplets,
} from 'lucide-react';
import {
  getSignals,
  getRiskLevel,
  getIndicators,
  getCrisisAlerts,
  getHistoricalCrises,
  type LiquiditySignal,
  type SystemicRiskLevel,
  type MacroIndicator,
  type CrisisAlert,
} from '../lib/utils/hobbyLiquidityCrisisService';

interface HobbyLiquidityCrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'risk-dashboard' | 'macro-indicators' | 'crisis-history' | 'alert-center';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'risk-dashboard', label: 'Risk Dashboard', icon: <Gauge size={16} /> },
  { id: 'macro-indicators', label: 'Macro Indicators', icon: <BarChart3 size={16} /> },
  { id: 'crisis-history', label: 'Crisis History', icon: <History size={16} /> },
  { id: 'alert-center', label: 'Alert Center', icon: <Bell size={16} /> },
];

const riskLabelConfig: Record<SystemicRiskLevel['label'], { label: string; color: string; bg: string; border: string }> = {
  red: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  orange: { label: 'Elevated', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  yellow: { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  green: { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

const severityConfig: Record<CrisisAlert['severity'], { label: string; color: string; bg: string; border: string }> = {
  systemic: { label: 'Systemic', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  sector: { label: 'Sector', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  localized: { label: 'Localized', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
};

const healthColors: Record<MacroIndicator['healthStatus'], string> = {
  healthy: 'bg-green-500',
  stressed: 'bg-amber-500',
  critical: 'bg-red-500',
};

const directionIcon = (dir: LiquiditySignal['direction']) => {
  if (dir === 'deteriorating') return <TrendingDown size={12} className="text-red-400" />;
  if (dir === 'improving') return <TrendingUp size={12} className="text-green-400" />;
  return <Minus size={12} className="text-slate-400" />;
};

// ---- Tab: Risk Dashboard ----

const RiskDashboardTab: React.FC = () => {
  const risk = useMemo(() => getRiskLevel(), []);
  const signals = useMemo(() => getSignals(), []);
  const rCfg = riskLabelConfig[risk.label];
  const gaugeColor = risk.label === 'red' ? '#ef4444' : risk.label === 'orange' ? '#f59e0b' : risk.label === 'yellow' ? '#eab308' : '#22c55e';

  const deterioratingCount = signals.filter(s => s.direction === 'deteriorating').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke={gaugeColor} strokeWidth="3" strokeDasharray={`${risk.overall} ${100 - risk.overall}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bebas tracking-wider text-white">{risk.overall}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${rCfg.color}`}>{rCfg.label}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-2 ${risk.trendDirection === 'worsening' ? 'text-red-400' : risk.trendDirection === 'improving' ? 'text-green-400' : 'text-slate-400'}`}>
            {risk.trendDirection === 'worsening' ? <TrendingDown size={14} /> : risk.trendDirection === 'improving' ? <TrendingUp size={14} /> : <Minus size={14} />}
            <span className="text-xs font-bold capitalize">{risk.trendDirection}</span>
            <span className="text-[10px] text-slate-500">(+{risk.weekOverWeekChange} WoW)</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-white font-medium mb-2">Systemic Risk Assessment</p>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            The hobby market is showing elevated stress signals. {deterioratingCount} of {signals.length} liquidity signals are deteriorating. Primary pressure comes from falling sell-through rates and widening bid-ask spreads.
          </p>
          <div className="space-y-1.5">
            <p className="text-[9px] text-slate-500 uppercase">Primary Drivers</p>
            {risk.primaryDrivers.map((driver, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                <AlertTriangle size={10} className="text-amber-400" />
                <span className="text-xs text-slate-300">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Liquidity Signals ({signals.length})</p>
        <div className="space-y-2">
          {signals.map(signal => {
            const absChange = Math.abs(signal.changePercent);
            const barWidth = Math.min(absChange / 50 * 100, 100);
            return (
              <div key={signal.id} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {directionIcon(signal.direction)}
                    <span className="text-sm text-white font-medium">{signal.metric}</span>
                    <span className="text-[10px] text-slate-500">({signal.source})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white">{signal.currentValue.toLocaleString()}</span>
                    <span className={`text-xs font-mono ${signal.changePercent < 0 ? 'text-red-400' : signal.changePercent > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                      {signal.changePercent > 0 ? '+' : ''}{signal.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${signal.direction === 'deteriorating' ? 'bg-red-500' : signal.direction === 'improving' ? 'bg-green-500' : 'bg-slate-500'}`} style={{ width: `${barWidth}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500">Wt: {(signal.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Macro Indicators ----

const MacroIndicatorsTab: React.FC = () => {
  const indicators = useMemo(() => getIndicators(), []);

  const categoryColors: Record<MacroIndicator['category'], string> = {
    marketplace: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    grading: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    auction: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    break: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    retail: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-3">
        {(['marketplace', 'grading', 'auction', 'break', 'retail'] as const).map(cat => {
          const items = indicators.filter(i => i.category === cat);
          const critCount = items.filter(i => i.healthStatus === 'critical').length;
          return (
            <div key={cat} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">{cat}</p>
              <p className="text-2xl font-bebas tracking-wider text-white">{items.length}</p>
              <p className="text-[10px] text-slate-500">{critCount > 0 ? <span className="text-red-400">{critCount} critical</span> : 'All OK'}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Indicator Details</p>
        <div className="space-y-2">
          {indicators.map(ind => {
            const history = ind.historicalValues;
            const maxHist = Math.max(...history.map(h => h.value));
            const minHist = Math.min(...history.map(h => h.value));
            const range = maxHist - minHist || 1;

            return (
              <div key={ind.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${categoryColors[ind.category]}`}>
                      {ind.category}
                    </span>
                    <p className="text-sm text-white font-medium">{ind.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthColors[ind.healthStatus]}`} />
                    <span className="text-[10px] text-slate-500 uppercase">{ind.healthStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-xl font-bebas tracking-wider text-white">
                    {ind.value >= 10000 ? `${(ind.value / 1000).toFixed(0)}K` : ind.value.toLocaleString()}
                  </p>
                  <span className="text-xs text-slate-500">{ind.unit}</span>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase mb-1.5">7-Month Trend</p>
                  <div className="flex items-end gap-1 h-10">
                    {history.map((point, idx) => {
                      const height = ((point.value - minHist) / range) * 100;
                      const isLast = idx === history.length - 1;
                      return (
                        <div key={point.date} className="flex-1 flex flex-col items-center">
                          <div className={`w-full rounded-t-sm ${isLast ? (ind.healthStatus === 'critical' ? 'bg-red-500' : ind.healthStatus === 'stressed' ? 'bg-amber-500' : 'bg-green-500') : 'bg-slate-600'}`} style={{ height: `${Math.max(height, 5)}%` }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[7px] text-slate-600">{history[0]?.date.slice(5)}</span>
                    <span className="text-[7px] text-slate-600">{history[history.length - 1]?.date.slice(5)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Crisis History ----

const CrisisHistoryTab: React.FC = () => {
  const historical = useMemo(() => getHistoricalCrises(), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Past Crises</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{historical.crises.length}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Duration</p>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">{historical.avgDurationDays}d</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Drawdown</p>
          <p className="text-2xl font-bebas tracking-wider text-red-400">-{historical.avgDrawdownPercent}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Past Crisis Events</p>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700" />
          <div className="space-y-4">
            {historical.crises.map(crisis => {
              const sCfg = severityConfig[crisis.severity];
              return (
                <div key={crisis.id} className="relative pl-14">
                  <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-2 ${crisis.severity === 'systemic' ? 'border-red-500 bg-red-500/30' : crisis.severity === 'sector' ? 'border-amber-500 bg-amber-500/30' : 'border-orange-500 bg-orange-500/30'}`} />
                  <div className={`p-5 ${sCfg.bg} border ${sCfg.border} rounded-xl`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sCfg.color} ${sCfg.bg} border ${sCfg.border}`}>
                          {sCfg.label}
                        </span>
                        <p className="text-sm text-white font-medium">{crisis.title}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(crisis.triggeredAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{crisis.description}</p>
                    <div className="p-2.5 bg-slate-800/50 rounded-lg mb-3">
                      <p className="text-[9px] text-slate-500 uppercase mb-0.5">Estimated Impact</p>
                      <p className="text-xs text-amber-300">{crisis.estimatedImpact}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {crisis.affectedSegments.map(seg => (
                        <span key={seg} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20">
                          {seg.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-amber-400" />
          <p className="text-xs font-bold text-amber-300">Recovery Patterns by Segment</p>
        </div>
        <div className="space-y-2">
          {historical.recoveryPatterns.map(rp => {
            const maxMonths = Math.max(...historical.recoveryPatterns.map(r => r.avgRecoveryMonths));
            const barWidth = (rp.avgRecoveryMonths / maxMonths) * 100;
            return (
              <div key={rp.segment} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-36 truncate">{rp.segment.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${rp.avgRecoveryMonths > 10 ? 'bg-red-500' : rp.avgRecoveryMonths > 6 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${barWidth}%` }} />
                </div>
                <span className="text-xs font-mono text-white w-16 text-right">{rp.avgRecoveryMonths}mo</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Alert Center ----

const AlertCenterTab: React.FC = () => {
  const activeAlerts = useMemo(() => getCrisisAlerts(false), []);
  const allAlerts = useMemo(() => getCrisisAlerts(true), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {(['systemic', 'sector', 'localized'] as const).map(sev => {
          const cfg = severityConfig[sev];
          const total = allAlerts.filter(a => a.severity === sev).length;
          const active = allAlerts.filter(a => a.severity === sev && !a.resolved).length;
          return (
            <div key={sev} className={`p-4 ${cfg.bg} border ${cfg.border} rounded-2xl text-center`}>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">{cfg.label}</p>
              <p className={`text-2xl font-bebas tracking-wider ${cfg.color}`}>{active}</p>
              <p className="text-[10px] text-slate-500">{total} total</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Alerts</p>
        <div className="space-y-2">
          {activeAlerts.map(alert => {
            const cfg = severityConfig[alert.severity];
            return (
              <div key={alert.id} className={`p-4 ${cfg.bg} border ${cfg.border} rounded-xl`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={cfg.color} />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Clock size={10} />
                    {new Date(alert.triggeredAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-white font-medium mb-1">{alert.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{alert.description}</p>
                <div className="p-2.5 bg-slate-800/50 rounded-lg mb-3">
                  <p className="text-[9px] text-slate-500 uppercase mb-0.5">Estimated Impact</p>
                  <p className="text-xs text-amber-300 leading-relaxed">{alert.estimatedImpact}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {alert.affectedSegments.map(seg => (
                    <span key={seg} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20">
                      {seg.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Resolved Alerts</p>
        <div className="space-y-2">
          {allAlerts.filter(a => a.resolved).map(alert => {
            const cfg = severityConfig[alert.severity];
            return (
              <div key={alert.id} className="p-4 bg-slate-800/20 border border-slate-700/30 rounded-xl opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                      {cfg.label}
                    </span>
                    <p className="text-sm text-white font-medium">{alert.title}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30">Resolved</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

const HobbyLiquidityCrisisModal: React.FC<HobbyLiquidityCrisisModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('risk-dashboard');
  const risk = useMemo(() => getRiskLevel(), []);
  const signals = useMemo(() => getSignals(), []);
  const activeAlerts = useMemo(() => getCrisisAlerts(false), []);
  const rCfg = riskLabelConfig[risk.label];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-700 bg-gradient-to-r from-amber-500/10 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
                <Droplets size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                  Hobby <span className="text-amber-400">Liquidity</span> Crisis Monitor
                </h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Systemic risk analysis &bull; {signals.length} signals tracked
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <Shield size={14} className="text-amber-400" />
              <span className="text-slate-400">Risk Level:</span>
              <span className={`font-bebas text-lg tracking-wider ${rCfg.color}`}>{rCfg.label}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <Gauge size={14} className="text-amber-400" />
              <span className="text-slate-400">Score:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{risk.overall}/100</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-slate-400">Active Alerts:</span>
              <span className="font-bebas text-lg text-red-400 tracking-wider">{activeAlerts.length}</span>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              Trend: <span className={`font-medium ${risk.trendDirection === 'worsening' ? 'text-red-400' : 'text-green-400'}`}>{risk.trendDirection}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-8 pt-4 border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-slate-500 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {activeTab === 'risk-dashboard' && <RiskDashboardTab />}
          {activeTab === 'macro-indicators' && <MacroIndicatorsTab />}
          {activeTab === 'crisis-history' && <CrisisHistoryTab />}
          {activeTab === 'alert-center' && <AlertCenterTab />}
        </div>
      </div>
    </div>
  );
};

export default HobbyLiquidityCrisisModal;
