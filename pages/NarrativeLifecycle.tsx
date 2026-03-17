import React, { useState } from 'react';
import { Radio, TrendingUp, Zap, Minus } from 'lucide-react';

const MOCK_NARRATIVES = [
  { id: '1', name: 'Rookie breakout — QB class 2024', stage: 'price_move', progress: 65, peakDate: '2025-02-15' },
  { id: '2', name: 'Vintage HOF demand spike', stage: 'social_spike', progress: 30, peakDate: '—' },
];

const NarrativeLifecycle: React.FC = () => {
  const [narratives] = useState(MOCK_NARRATIVES);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Radio size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Narrative Lifecycle Tracker</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Track a narrative (e.g. “rookie breakout”) from first mention → social spike → price move → exhaustion. Helps time entries and exits.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Zap size={12} className="text-sky-400" /> Active narratives</div>
          <div className="text-2xl font-bold text-sky-400">{narratives.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Stages</div>
          <div className="text-2xl font-bold text-emerald-400">4</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Minus size={12} className="text-amber-400" /> Exhaustion alerts</div>
          <div className="text-2xl font-bold text-amber-400">—</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Narrative pipeline (mock)</h3>
        <ul className="space-y-3">
          {narratives.map(n => (
            <li key={n.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{n.name}</span>
                <p className="text-slate-500 text-xs mt-1">Stage: {n.stage} · {n.progress}%</p>
              </div>
              <span className="text-slate-400 text-xs">{n.peakDate}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NarrativeLifecycle;
