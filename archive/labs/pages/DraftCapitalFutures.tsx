import React, { useState } from 'react';
import { Target } from 'lucide-react';
import DraftCapitalFuturesModal from '../components/DraftCapitalFuturesModal.tsx';

const DraftCapitalFutures: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <Target size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Draft Capital Futures</h1>
          <p className="text-sm text-slate-400">Pre-draft investment modeling for undrafted prospects across all sports</p>
        </div>
      </div>
      <DraftCapitalFuturesModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Draft Capital Futures
        </button>
      )}
    </div>
  );
};

export default DraftCapitalFutures;
