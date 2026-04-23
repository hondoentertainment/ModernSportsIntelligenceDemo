// @ts-nocheck
import React, { useState } from 'react';
import { Shield, Clock, RefreshCw, Activity } from 'lucide-react';

const PortfolioImmunization: React.FC = () => {
  const [durationMonths] = useState(14);
  const [targetMonths] = useState(8);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Shield size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Portfolio Immunization</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Bond-style duration: your portfolio’s “duration” to a hobby recession is X months; rebalancing to Y shortens it. Duration and convexity for collectibles.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-sky-400" /> Current duration</div>
          <div className="text-2xl font-bold text-sky-400">{durationMonths} mo</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><RefreshCw size={12} className="text-emerald-400" /> Target duration</div>
          <div className="text-2xl font-bold text-emerald-400">{targetMonths} mo</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Activity size={12} className="text-amber-400" /> Rebalance impact</div>
          <div className="text-2xl font-bold text-amber-400">—</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">How it works</h3>
        <p className="text-slate-400 text-sm">Duration measures sensitivity to a market downturn. Higher duration = more exposure to a prolonged slump. Rebalancing toward liquid, defensive segments shortens duration. Convexity (second-order sensitivity) can be shown for advanced users.</p>
      </div>
    </div>
  );
};

export default PortfolioImmunization;
