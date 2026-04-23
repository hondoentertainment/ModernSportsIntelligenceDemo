// @ts-nocheck
import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import CollectionEntropyModal from '../components/CollectionEntropyModal.tsx';

const CollectionEntropy: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20"><Dices size={24} className="text-indigo-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collection Entropy Score</h1>
          <p className="text-sm text-slate-400">Measure collection diversity and balance</p>
        </div>
      </div>
      <CollectionEntropyModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Collection Entropy Score</button>
      )}
    </div>
  );
};

export default CollectionEntropy;
