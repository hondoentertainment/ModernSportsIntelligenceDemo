// @ts-nocheck
import React, { useState } from 'react';
import { Radar, TrendingUp, Users, DollarSign } from 'lucide-react';

const MOCK_FLOWS = [
  { segment: 'PSA 10 Rookie QBs', direction: 'inflow', change: 12.4, volume: 2.4 },
  { segment: 'Vintage HOF', direction: 'outflow', change: -3.2, volume: 1.1 },
  { segment: 'Soccer stars', direction: 'inflow', change: 8.1, volume: 0.8 },
];

const CapitalFlowRadar: React.FC = () => {
  const [flows] = useState(MOCK_FLOWS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Radar size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Capital Flow Radar</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Where is money moving? Players, grades, venues. Institutional-style flow analytics for the hobby.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-sky-400" /> Segments tracked</div>
          <div className="text-2xl font-bold text-sky-400">{flows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><DollarSign size={12} className="text-emerald-400" /> Net flow (7d)</div>
          <div className="text-2xl font-bold text-emerald-400">+$4.2M</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Users size={12} className="text-amber-400" /> Venues</div>
          <div className="text-2xl font-bold text-amber-400">eBay, Goldin, PWCC</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Flow by segment (mock)</h3>
        <ul className="space-y-3">
          {flows.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-slate-300">{f.segment}</span>
              <div className="flex items-center gap-4">
                <span className={f.direction === 'inflow' ? 'text-emerald-400' : 'text-red-400'}>{f.change > 0 ? '+' : ''}{f.change}%</span>
                <span className="text-slate-500">Vol ${f.volume}M</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CapitalFlowRadar;
