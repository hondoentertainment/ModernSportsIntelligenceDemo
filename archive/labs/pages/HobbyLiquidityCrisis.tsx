import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import HobbyLiquidityCrisisModal from '../components/HobbyLiquidityCrisisModal.tsx';

const HobbyLiquidityCrisis: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <AlertTriangle size={24} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Hobby Liquidity Crisis Detector</h1>
          <p className="text-sm text-slate-400">Systemic macro risk monitor for hobby-wide liquidity contractions</p>
        </div>
      </div>
      <HobbyLiquidityCrisisModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Hobby Liquidity Crisis Detector
        </button>
      )}
    </div>
  );
};

export default HobbyLiquidityCrisis;
