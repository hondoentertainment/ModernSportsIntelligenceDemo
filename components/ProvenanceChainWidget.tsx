import React from 'react';
import {
  Fingerprint,
  Shield,
  ShieldAlert,
  ChevronRight,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { getRegistryStats, getFraudAlerts } from '../lib/provenanceChainService.ts';

interface Props {
  onOpenModal?: () => void;
}

const ProvenanceChainWidget: React.FC<Props> = ({ onOpenModal }) => {
  const stats = getRegistryStats();
  const alerts = getFraudAlerts().filter(a => a.status === 'active');

  const fmtValue = (n: number): string => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Fingerprint size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Card DNA &amp; <span className="text-cyan-400">Provenance</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Carfax for Sports Cards
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Fingerprint size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">Registered</span>
          </div>
          <span className="font-bebas text-2xl text-cyan-400 tracking-wider">
            {stats.totalCardsRegistered.toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">Fraud Stopped</span>
          </div>
          <span className="font-bebas text-2xl text-emerald-400 tracking-wider">
            {stats.fraudPrevented}
          </span>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 size={12} className="text-amber-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">Protected</span>
          </div>
          <span className="font-bebas text-2xl text-amber-400 tracking-wider">
            {fmtValue(stats.valueProtected)}
          </span>
        </div>
      </div>

      {/* Recent Fraud Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={10} />
            Active Fraud Alerts
          </p>
          <div className="space-y-1.5">
            {alerts.slice(0, 2).map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs"
              >
                <ShieldAlert size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{alert.cardName}</p>
                  <p className="text-[10px] text-red-400/80 mt-0.5 line-clamp-1">{alert.description}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick-Search Hint */}
      <div className="flex items-center gap-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <Search size={14} className="text-slate-500" />
        <span className="text-xs text-slate-500">
          Verify any card&apos;s authenticity — cert # or listing URL
        </span>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
        <Fingerprint size={14} className="text-cyan-400" />
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          Register a Card
        </span>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
        Click to open Card DNA &amp; Provenance Center
      </p>
    </button>
  );
};

export default ProvenanceChainWidget;
