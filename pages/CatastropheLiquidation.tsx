import React, { useState } from 'react';
import { AlertTriangle, Clock, DollarSign, ListOrdered } from 'lucide-react';

const MOCK_SEQUENCE = [
  { order: 1, asset: 'Liquid PSA 10 RC', estRecovery: 92, timeline: '0–24h' },
  { order: 2, asset: 'Mid-tier graded', estRecovery: 78, timeline: '24–72h' },
  { order: 3, asset: 'Vintage / illiquid', estRecovery: 55, timeline: '7d+' },
];

const CatastropheLiquidation: React.FC = () => {
  const [sequence] = useState(MOCK_SEQUENCE);
  const targetCash = 50000;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <AlertTriangle size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Catastrophe Liquidation Simulator</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          If you had to raise $X in 48 hours, optimal sequence and expected haircut. Stress-test for emergency cash needs; extends bankruptcy-shield concept.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><DollarSign size={12} className="text-sky-400" /> Target cash (48h)</div>
          <div className="text-2xl font-bold text-sky-400">${(targetCash / 1000).toFixed(0)}K</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><ListOrdered size={12} className="text-emerald-400" /> Steps</div>
          <div className="text-2xl font-bold text-emerald-400">{sequence.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-amber-400" /> Avg recovery</div>
          <div className="text-2xl font-bold text-amber-400">75%</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Optimal liquidation sequence (mock)</h3>
        <ul className="space-y-3">
          {sequence.map(s => (
            <li key={s.order} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-slate-400 w-8">#{s.order}</span>
              <span className="text-slate-300 flex-1">{s.asset}</span>
              <span className="text-emerald-400">{s.estRecovery}% recovery</span>
              <span className="text-slate-500 text-xs">{s.timeline}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CatastropheLiquidation;
