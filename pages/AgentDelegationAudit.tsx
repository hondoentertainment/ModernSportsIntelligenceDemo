// @ts-nocheck
import React, { useState } from 'react';
import { FileCheck, UserCheck, Clock, Download } from 'lucide-react';

const MOCK_AUDIT = [
  { id: '1', agentAction: 'Buy 2020 Herbert Prizm PSA 10', humanDecision: 'Approved', outcome: 'Filled @ $1,240', ts: '2025-03-10T14:22:00Z' },
  { id: '2', agentAction: 'Sell Luka BGS 9.5', humanDecision: 'Rejected', outcome: '—', ts: '2025-03-09T09:15:00Z' },
];

const AgentDelegationAudit: React.FC = () => {
  const [entries] = useState(MOCK_AUDIT);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <FileCheck size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Delegation Audit</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Full log of agent requested X → human approved/rejected → outcome Z with export for compliance. Critical for institutional and regulated use.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><UserCheck size={12} className="text-sky-400" /> Audit entries</div>
          <div className="text-2xl font-bold text-sky-400">{entries.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-emerald-400" /> Export</div>
          <div className="text-2xl font-bold text-emerald-400">CSV / JSON</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Download size={12} className="text-amber-400" /> Compliance-ready</div>
          <div className="text-2xl font-bold text-amber-400">Yes</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Delegation log (mock)</h3>
        <ul className="space-y-3">
          {entries.map(e => (
            <li key={e.id} className="rounded-xl bg-slate-800/50 p-3 text-sm grid grid-cols-1 md:grid-cols-4 gap-2">
              <span className="text-slate-300">{e.agentAction}</span>
              <span className={e.humanDecision === 'Approved' ? 'text-emerald-400' : 'text-red-400'}>{e.humanDecision}</span>
              <span className="text-slate-400">{e.outcome}</span>
              <span className="text-slate-500 text-xs">{new Date(e.ts).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentDelegationAudit;
