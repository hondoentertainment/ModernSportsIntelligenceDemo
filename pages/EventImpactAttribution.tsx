// @ts-nocheck
import React, { useState } from 'react';
import { Zap, Calendar, TrendingUp, Target } from 'lucide-react';

const MOCK_ATTRIBUTIONS = [
  { event: 'Rookie call-up', asset: '2024 Bowman Chrome Auto', impactPct: 18.2, date: '2025-02-15' },
  { event: 'Award announcement', asset: 'MVP Prizm RC', impactPct: 8.4, date: '2025-02-10' },
];

const EventImpactAttribution: React.FC = () => {
  const [attributions] = useState(MOCK_ATTRIBUTIONS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Zap size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Event Impact Attribution</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Attribute price move to specific event (trade, injury, award). Not standard in the industry.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Target size={12} className="text-sky-400" /> Events attributed</div>
          <div className="text-2xl font-bold text-sky-400">{attributions.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Avg impact</div>
          <div className="text-2xl font-bold text-emerald-400">+13.3%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Calendar size={12} className="text-amber-400" /> Window</div>
          <div className="text-2xl font-bold text-amber-400">7d</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Attributions (mock)</h3>
        <ul className="space-y-3">
          {attributions.map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{a.event}</span>
                <p className="text-slate-500 text-xs mt-1">{a.asset} · {a.date}</p>
              </div>
              <span className="text-emerald-400 font-medium">+{a.impactPct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventImpactAttribution;
