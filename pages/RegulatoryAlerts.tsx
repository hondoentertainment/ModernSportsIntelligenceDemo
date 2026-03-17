import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, Bell } from 'lucide-react';

const MOCK_ALERTS = [
  { id: '1', title: '1099-K threshold change (2025)', jurisdiction: 'Federal', severity: 'high', date: '2025-01-15' },
  { id: '2', title: 'Sales tax nexus update — Texas', jurisdiction: 'State', severity: 'medium', date: '2025-02-01' },
];

const RegulatoryAlerts: React.FC = () => {
  const [alerts] = useState(MOCK_ALERTS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Shield size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Regulatory Change Alerts</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Proactive alerts when state/federal rules change: sales tax nexus, collectibles-as-securities, 1099-K thresholds. No hobby tool offers regulatory monitoring.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Bell size={12} className="text-sky-400" /> Active alerts</div>
          <div className="text-2xl font-bold text-sky-400">{alerts.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><AlertTriangle size={12} className="text-amber-400" /> High severity</div>
          <div className="text-2xl font-bold text-amber-400">1</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><FileText size={12} className="text-emerald-400" /> Jurisdictions</div>
          <div className="text-2xl font-bold text-emerald-400">Federal, State</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Recent regulatory alerts (mock)</h3>
        <ul className="space-y-3">
          {alerts.map(a => (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{a.title}</span>
                <p className="text-slate-500 text-xs mt-1">{a.jurisdiction} · {a.date}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegulatoryAlerts;
