import React, { useState } from 'react';
import { Droplets, Percent, Shield, Calculator } from 'lucide-react';

const LiquidityReserveCalculator: React.FC = () => {
  const [recommendedPct] = useState(15);
  const [currentPct] = useState(8);
  const [gap] = useState(7);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Droplets size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Liquidity Reserve Calculator</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Recommend % of portfolio to hold in liquid cards for emergencies. Novel.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Percent size={12} className="text-sky-400" /> Recommended</div>
          <div className="text-2xl font-bold text-sky-400">{recommendedPct}%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-emerald-400" /> Current</div>
          <div className="text-2xl font-bold text-emerald-400">{currentPct}%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Calculator size={12} className="text-amber-400" /> Gap</div>
          <div className="text-2xl font-bold text-amber-400">+{gap}%</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Guidance</h3>
        <p className="text-slate-400 text-sm">Hold 15–20% in high-liquidity cards (fast exit, tight spreads) to cover unexpected cash needs without fire-selling illiquid assets.</p>
      </div>
    </div>
  );
};

export default LiquidityReserveCalculator;
