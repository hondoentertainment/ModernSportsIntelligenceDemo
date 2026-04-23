// @ts-nocheck
import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import CollectorBurnoutIndexModal from '../components/CollectorBurnoutIndexModal.tsx';

const CollectorBurnoutIndex: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20"><Flame size={24} className="text-orange-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collector Burnout Index</h1>
          <p className="text-sm text-slate-400">Monitor collector fatigue and burnout signals</p>
        </div>
      </div>
      <CollectorBurnoutIndexModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Collector Burnout Index</button>
      )}
    </div>
  );
};

export default CollectorBurnoutIndex;
