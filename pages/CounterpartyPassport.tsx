import React, { useState } from 'react';
import { Fingerprint, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

const MOCK_PASSPORTS = [
  { id: '1', name: 'Seller_Apex_99', trustScore: 92, deals: 47, disputes: 0, venues: ['eBay', 'COMC'] },
  { id: '2', name: 'VaultTrader', trustScore: 78, deals: 12, disputes: 1, venues: ['PWCC'] },
];

const CounterpartyPassport: React.FC = () => {
  const [passports] = useState(MOCK_PASSPORTS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Fingerprint size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Counterparty Passport</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Portable reputation: trust score, dispute history, and deal velocity that follow the counterparty across venues. Full passport with cross-platform identity resolution.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-emerald-400" /> Passports tracked</div>
          <div className="text-2xl font-bold text-emerald-400">{passports.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-sky-400" /> Avg trust score</div>
          <div className="text-2xl font-bold text-sky-400">85</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><AlertTriangle size={12} className="text-amber-400" /> Cross-venue</div>
          <div className="text-2xl font-bold text-amber-400">Yes</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Passport directory (mock)</h3>
        <ul className="space-y-3">
          {passports.map(p => (
            <li key={p.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4 text-sm">
              <div>
                <span className="text-white font-medium">{p.name}</span>
                <p className="text-slate-500 text-xs mt-1">{p.venues.join(', ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${p.trustScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>{p.trustScore}</span>
                <span className="text-slate-500">{p.deals} deals</span>
                <span className={p.disputes > 0 ? 'text-red-400' : 'text-slate-500'}>{p.disputes} disputes</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CounterpartyPassport;
