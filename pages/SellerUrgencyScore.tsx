import React, { useState } from 'react';
import { Zap, Clock, TrendingDown, Target } from 'lucide-react';

const MOCK_LISTINGS = [
  { id: '1', title: 'Herbert Prizm PSA 10', daysListed: 47, priceDrops: 2, urgencyScore: 82 },
  { id: '2', title: 'Luka BGS 9.5', daysListed: 12, priceDrops: 0, urgencyScore: 34 },
];

const SellerUrgencyScore: React.FC = () => {
  const [listings] = useState(MOCK_LISTINGS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Zap size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Seller Urgency Score</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Listing age, price drops, views → urgency score for negotiation timing. Novel.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Target size={12} className="text-sky-400" /> Listings scored</div>
          <div className="text-2xl font-bold text-sky-400">{listings.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingDown size={12} className="text-emerald-400" /> High urgency</div>
          <div className="text-2xl font-bold text-emerald-400">1</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-amber-400" /> Factors</div>
          <div className="text-2xl font-bold text-amber-400">Age, drops</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Urgency by listing (mock)</h3>
        <ul className="space-y-3">
          {listings.map(l => (
            <li key={l.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <div>
                <span className="text-white font-medium">{l.title}</span>
                <p className="text-slate-500 text-xs mt-1">{l.daysListed}d listed · {l.priceDrops} price drops</p>
              </div>
              <span className={l.urgencyScore >= 70 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{l.urgencyScore}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SellerUrgencyScore;
