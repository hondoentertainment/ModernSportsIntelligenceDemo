import React, { useState } from 'react';
import { TrendingDown, Shield, Clock, AlertTriangle } from 'lucide-react';

const MOCK_DECAY = [
  { name: 'Seller_Apex_99', lastDeal: '45d ago', disputes: 0, score: 92, decay: 0 },
  { name: 'VaultTrader', lastDeal: '120d ago', disputes: 1, score: 71, decay: -7 },
];

const ReputationDecayTracker: React.FC = () => {
  const [entries] = useState(MOCK_DECAY);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <TrendingDown size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Reputation Decay Tracker</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          How counterparty reputation decays after disputes or inactivity. Novel.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-sky-400" /> Counterparties</div>
          <div className="text-2xl font-bold text-sky-400">{entries.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-emerald-400" /> Decay model</div>
          <div className="text-2xl font-bold text-emerald-400">Active</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><AlertTriangle size={12} className="text-amber-400" /> With decay</div>
          <div className="text-2xl font-bold text-amber-400">1</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Decay by counterparty (mock)</h3>
        <ul className="space-y-3">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{e.name}</span>
                <p className="text-slate-500 text-xs mt-1">Last deal {e.lastDeal} · Disputes {e.disputes}</p>
              </div>
              <span className={e.decay < 0 ? 'text-amber-400' : 'text-emerald-400'}>Score {e.score} {e.decay !== 0 ? `(${e.decay})` : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReputationDecayTracker;
