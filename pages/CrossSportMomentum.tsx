import React, { useState } from 'react';
import { GitBranch, TrendingUp, Clock, Activity } from 'lucide-react';

const MOCK_MOMENTUM = [
  { sport: 'Football', momentum: 1.24, lagDays: 0, lead: true },
  { sport: 'Basketball', momentum: 0.92, lagDays: 14, lead: false },
  { sport: 'Baseball', momentum: 0.88, lagDays: 21, lead: false },
];

const CrossSportMomentum: React.FC = () => {
  const [rows] = useState(MOCK_MOMENTUM);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <GitBranch size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Cross-Sport Momentum</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          When one sport&apos;s cards run hot, lagged effect on others. Novel.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Activity size={12} className="text-sky-400" /> Sports</div>
          <div className="text-2xl font-bold text-sky-400">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Lead sport</div>
          <div className="text-2xl font-bold text-emerald-400">Football</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-amber-400" /> Lag window</div>
          <div className="text-2xl font-bold text-amber-400">0–21d</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Momentum index by sport (mock)</h3>
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-white font-medium">{r.sport}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Lag {r.lagDays}d</span>
                <span className={r.lead ? 'text-emerald-400 font-bold' : 'text-slate-300'}>Index {r.momentum}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CrossSportMomentum;
