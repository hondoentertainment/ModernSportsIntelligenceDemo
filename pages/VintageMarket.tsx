import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import VintageMarketModal from '../components/VintageMarketModal';

const VintageMarket: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Clock size={24} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Vintage Market Scanner</h1>
          <p className="text-sm text-slate-400">The Sotheby's Intelligence Desk for Pre-1980 Cards</p>
        </div>
      </div>
      <VintageMarketModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Vintage Market Scanner
        </button>
      )}
    </div>
  );
};

export default VintageMarket;
