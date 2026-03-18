import React, { useState } from 'react';
import { Clock, Package, CheckCircle } from 'lucide-react';

const MOCK_QUEUES = [
  { company: 'PSA', tier: 'Economy', estPosition: 42000, etaDays: 45 },
  { company: 'BGS', tier: 'Standard', estPosition: 1200, etaDays: 14 },
];

const GradingQueueEstimator: React.FC = () => {
  const [queues] = useState(MOCK_QUEUES);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Package size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Grading Queue Estimator</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Estimated position in PSA/BGS queue and ETA. Not offered elsewhere.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Package size={12} className="text-sky-400" /> Companies</div>
          <div className="text-2xl font-bold text-sky-400">PSA, BGS</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-emerald-400" /> Est. ETA range</div>
          <div className="text-2xl font-bold text-emerald-400">14–45d</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><CheckCircle size={12} className="text-amber-400" /> Tiers</div>
          <div className="text-2xl font-bold text-amber-400">Economy, Std</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Queue estimates (mock)</h3>
        <ul className="space-y-3">
          {queues.map((q, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-white font-medium">{q.company} {q.tier}</span>
              <span className="text-slate-400">Pos ~{q.estPosition.toLocaleString()} · ETA {q.etaDays}d</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GradingQueueEstimator;
