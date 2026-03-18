import React, { useState } from 'react';
import { TrendingUp, Percent, MapPin, BarChart3 } from 'lucide-react';

const MOCK_SPREADS = [
  { venue: 'eBay', card: '2020 Prizm Herbert PSA 10', predictedSpreadPct: 4.2, currentSpreadPct: 5.1 },
  { venue: 'Goldin', card: '2018 Luka BGS 9.5', predictedSpreadPct: 6.8, currentSpreadPct: 7.2 },
];

const BidAskSpreadPredictor: React.FC = () => {
  const [spreads] = useState(MOCK_SPREADS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <BarChart3 size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Bid-Ask Spread Predictor</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Predict short-term bid-ask spread by venue and card. No hobby tool offers spread prediction.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Percent size={12} className="text-sky-400" /> Avg predicted spread</div>
          <div className="text-2xl font-bold text-sky-400">5.5%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><MapPin size={12} className="text-emerald-400" /> Venues</div>
          <div className="text-2xl font-bold text-emerald-400">eBay, Goldin</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-amber-400" /> Horizon</div>
          <div className="text-2xl font-bold text-amber-400">7d</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Predicted spreads (mock)</h3>
        <ul className="space-y-3">
          {spreads.map((s, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-slate-300">{s.venue} · {s.card}</span>
              <span className="text-emerald-400">Pred {s.predictedSpreadPct}% · Now {s.currentSpreadPct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BidAskSpreadPredictor;
