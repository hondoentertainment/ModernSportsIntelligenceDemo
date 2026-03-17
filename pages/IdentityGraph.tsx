import React, { useState } from 'react';
import { Network, Users, Link2, Shield } from 'lucide-react';

const MOCK_ENTITIES = [
  { id: '1', displayName: 'Seller_Apex_99', venues: ['eBay', 'COMC'], linked: true },
  { id: '2', displayName: 'VaultTrader', venues: ['PWCC', 'eBay'], linked: true },
];

const IdentityGraph: React.FC = () => {
  const [entities] = useState(MOCK_ENTITIES);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Network size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Cross-Venue Identity Graph</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Link the same seller/buyer across eBay, COMC, PWCC, etc. for true counterparty history and concentration risk. No one unifies identity across venues.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Users size={12} className="text-sky-400" /> Resolved entities</div>
          <div className="text-2xl font-bold text-sky-400">{entities.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Link2 size={12} className="text-emerald-400" /> Venues</div>
          <div className="text-2xl font-bold text-emerald-400">eBay, COMC, PWCC</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-amber-400" /> Privacy-safe</div>
          <div className="text-2xl font-bold text-amber-400">Hashed</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Identity clusters (mock)</h3>
        <ul className="space-y-3">
          {entities.map(e => (
            <li key={e.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-white font-medium">{e.displayName}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{e.venues.join(' → ')}</span>
                {e.linked && <span className="text-emerald-400 text-xs">Linked</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IdentityGraph;
