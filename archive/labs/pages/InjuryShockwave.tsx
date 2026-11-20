import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import InjuryShockwaveModal from '../components/InjuryShockwaveModal.tsx';

const InjuryShockwave: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20">
          <Zap size={24} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Injury Shockwave Engine</h1>
          <p className="text-sm text-slate-400">Real-time injury impact propagation across player networks</p>
        </div>
      </div>
      <InjuryShockwaveModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Shockwave Engine
        </button>
      )}
    </div>
  );
};

export default InjuryShockwave;
