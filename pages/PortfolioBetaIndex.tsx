// @ts-nocheck
import React, { useState } from 'react';
import { GitBranch, Activity, BarChart3 } from 'lucide-react';

const PortfolioBetaIndex: React.FC = () => {
  const [beta] = useState(1.12);
  const [correlation] = useState(0.89);
  const [indexName] = useState('PSA 10 Rookie QB Index');

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <GitBranch size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Portfolio Beta to Index</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Beta and correlation of your portfolio to a custom or standard card index. Institutional-grade.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Activity size={12} className="text-sky-400" /> Beta</div>
          <div className="text-2xl font-bold text-sky-400">{beta}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><BarChart3 size={12} className="text-emerald-400" /> Correlation</div>
          <div className="text-2xl font-bold text-emerald-400">{correlation}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Index</div>
          <div className="text-lg font-bold text-amber-400 truncate">{indexName}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Interpretation</h3>
        <p className="text-slate-400 text-sm">Beta &gt; 1: portfolio moves more than the index. Correlation near 1: moves in line with index. Use to hedge or tilt exposure.</p>
      </div>
    </div>
  );
};

export default PortfolioBetaIndex;
