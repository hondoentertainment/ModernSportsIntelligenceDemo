import React, { useState } from 'react';
import { BarChart3, Plus, TrendingUp, Layers } from 'lucide-react';

const MOCK_INDICES = [
  { name: 'PSA 10 Rookie QBs 2018–2022', value: 100, change1d: 0.4, constituents: 12 },
  { name: 'Vintage HOF Top 50', value: 98.2, change1d: -0.2, constituents: 50 },
];

const SyntheticIndexBuilder: React.FC = () => {
  const [indices] = useState(MOCK_INDICES);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <BarChart3 size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Synthetic Index Builder</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          User-defined custom index (e.g. PSA 10 Rookie QBs 2018–2022) with daily index value and attribution. No platform offers user-defined collectible indices with live valuation.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Layers size={12} className="text-sky-400" /> Custom indices</div>
          <div className="text-2xl font-bold text-sky-400">{indices.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Base value</div>
          <div className="text-2xl font-bold text-emerald-400">100</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Plus size={12} className="text-amber-400" /> Create new</div>
          <div className="text-2xl font-bold text-amber-400">—</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Your indices (mock)</h3>
        <ul className="space-y-3">
          {indices.map((idx, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{idx.name}</span>
                <p className="text-slate-500 text-xs mt-1">{idx.constituents} constituents</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-300">Index {idx.value}</span>
                <span className={idx.change1d >= 0 ? 'text-emerald-400' : 'text-red-400'}>{idx.change1d >= 0 ? '+' : ''}{idx.change1d}% (1d)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SyntheticIndexBuilder;
