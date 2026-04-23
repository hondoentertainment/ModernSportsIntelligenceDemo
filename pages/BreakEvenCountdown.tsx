// @ts-nocheck
import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import BreakEvenCountdownModal from '../components/BreakEvenCountdownModal.tsx';

const BreakEvenCountdown: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20"><Timer size={24} className="text-emerald-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Break-Even Countdown</h1>
          <p className="text-sm text-slate-400">Track when your investments will become profitable</p>
        </div>
      </div>
      <BreakEvenCountdownModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Break-Even Countdown</button>
      )}
    </div>
  );
};

export default BreakEvenCountdown;
