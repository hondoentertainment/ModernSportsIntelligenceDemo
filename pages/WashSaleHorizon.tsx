import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const MOCK_WINDOWS = [
  { lotId: 'L1', asset: 'Herbert Prizm PSA 10', soldDate: '2025-02-01', washWindowEnd: '2025-03-03', clear: true },
  { lotId: 'L2', asset: 'Luka BGS 9.5', soldDate: '2025-03-01', washWindowEnd: '2025-04-01', clear: false },
];

const WashSaleHorizon: React.FC = () => {
  const [windows] = useState(MOCK_WINDOWS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Calendar size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Wash-Sale Horizon Calendar</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Calendar of tax wash-sale windows per lot; avoid triggering wash-sale rules. Industry-absent.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-sky-400" /> Active windows</div>
          <div className="text-2xl font-bold text-sky-400">{windows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><AlertTriangle size={12} className="text-amber-400" /> In window</div>
          <div className="text-2xl font-bold text-amber-400">1</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><CheckCircle size={12} className="text-emerald-400" /> Clear to buy</div>
          <div className="text-2xl font-bold text-emerald-400">1</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Wash-sale windows (mock)</h3>
        <ul className="space-y-3">
          {windows.map(w => (
            <li key={w.lotId} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{w.asset}</span>
                <p className="text-slate-500 text-xs mt-1">Sold {w.soldDate} · Window ends {w.washWindowEnd}</p>
              </div>
              <span className={w.clear ? 'text-emerald-400' : 'text-amber-400'}>{w.clear ? 'Clear' : 'In window'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WashSaleHorizon;
