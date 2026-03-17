import React, { useState } from 'react';
import { BookOpen, DollarSign, Calendar, Hash } from 'lucide-react';

const MOCK_SALES = [
  { id: '1', asset: '2020 Prizm Justin Herbert RC PSA 10', price: 1250, venue: 'eBay', date: '2025-03-01' },
  { id: '2', asset: '2018 Prizm Luka Doncic RC BGS 9.5', price: 4200, venue: 'Goldin', date: '2025-02-28' },
  { id: '3', asset: '1986 Fleer Michael Jordan #57 PSA 9', price: 18500, venue: 'Heritage', date: '2025-02-27' },
];

const MarketTruthLedger: React.FC = () => {
  const [sales] = useState(MOCK_SALES);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <BookOpen size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Market Truth Ledger</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Single source of truth for what actually sold (eBay, auctions) with provenance. Normalized, queryable “last N real sales” per card to validate AI and power comp-backed confidence.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Hash size={12} className="text-sky-400" /> Verified sales</div>
          <div className="text-2xl font-bold text-sky-400">—</div>
          <p className="text-xs text-slate-500 mt-1">Live feed when eBay/auction APIs are connected</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><DollarSign size={12} className="text-emerald-400" /> Avg comp</div>
          <div className="text-2xl font-bold text-emerald-400">$7,983</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Calendar size={12} className="text-amber-400" /> Last updated</div>
          <div className="text-2xl font-bold text-amber-400">Demo</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Sample verified sales (mock)</h3>
        <ul className="space-y-3">
          {sales.map(s => (
            <li key={s.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-slate-300">{s.asset}</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-medium">${s.price.toLocaleString()}</span>
                <span className="text-slate-500 text-xs">{s.venue} · {s.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarketTruthLedger;
