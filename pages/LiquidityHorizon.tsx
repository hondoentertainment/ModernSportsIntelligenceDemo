import React, { useState } from 'react';
import { Clock, Percent, BarChart3, Zap } from 'lucide-react';

const MOCK_HORIZONS = [
  { label: '1 day', pct90: 45, pct95: 62, pct99: 78 },
  { label: '7 days', pct90: 72, pct95: 85, pct99: 92 },
  { label: '30 days', pct90: 88, pct95: 94, pct99: 98 },
  { label: '90 days', pct90: 95, pct95: 98, pct99: 99 },
];

const LiquidityHorizon: React.FC = () => {
  const [horizons] = useState(MOCK_HORIZONS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Clock size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Liquidity Horizon Curve</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Per card or portfolio: probability of exit at X% of FMV within 1d / 7d / 30d / 90d from real depth and velocity. Institutional-style liquidity risk.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Percent size={12} className="text-sky-400" /> 90% FMV (7d)</div>
          <div className="text-2xl font-bold text-sky-400">72%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><BarChart3 size={12} className="text-emerald-400" /> 95% FMV (30d)</div>
          <div className="text-2xl font-bold text-emerald-400">94%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Zap size={12} className="text-amber-400" /> Horizon buckets</div>
          <div className="text-2xl font-bold text-amber-400">4</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Exit probability at % of FMV (mock)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-left border-b border-slate-700">
                <th className="pb-2 pr-4">Horizon</th>
                <th className="pb-2 pr-4">90% FMV</th>
                <th className="pb-2 pr-4">95% FMV</th>
                <th className="pb-2">99% FMV</th>
              </tr>
            </thead>
            <tbody>
              {horizons.map(h => (
                <tr key={h.label} className="border-b border-slate-800">
                  <td className="py-2 text-slate-300">{h.label}</td>
                  <td className="py-2 text-sky-400">{h.pct90}%</td>
                  <td className="py-2 text-emerald-400">{h.pct95}%</td>
                  <td className="py-2 text-amber-400">{h.pct99}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiquidityHorizon;
