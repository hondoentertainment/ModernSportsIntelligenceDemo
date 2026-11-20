import React, { useState } from 'react';
import { Shield, Umbrella } from 'lucide-react';
import DerivativesDeskModal from '../components/DerivativesDeskModal.tsx';

const DerivativesDesk: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20">
          <Shield size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Derivatives Desk</h1>
          <p className="text-sm text-slate-400">Options, Insurance & Hedging — Wall Street Risk Management for Cards</p>
        </div>
        <Umbrella size={18} className="text-blue-400/40 ml-1" />
      </div>
      <DerivativesDeskModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Derivatives Desk
        </button>
      )}
    </div>
  );
};

export default DerivativesDesk;
