// @ts-nocheck
import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { MarketIndicesModal } from '../components/MarketIndicesModal';

const MarketIndices: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
            <BarChart3 className="text-brand-lime" size={32} />
            MSI Market Indices
          </h1>
          <p className="text-slate-400">
            Proprietary Benchmarks — The S&P 500 of Sports Cards
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-lime/10 text-brand-lime text-xs font-black uppercase tracking-widest rounded-xl border border-brand-lime/20 hover:bg-brand-lime/20 transition-colors"
        >
          Open Dashboard
        </button>
      </div>

      <MarketIndicesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default MarketIndices;
