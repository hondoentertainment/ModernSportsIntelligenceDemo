// @ts-nocheck
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import CardAgingClockModal from '../components/CardAgingClockModal.tsx';

const CardAgingClock: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20"><Clock size={24} className="text-orange-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card DNA Aging Clock</h1>
          <p className="text-sm text-slate-400">Track card condition aging over time</p>
        </div>
      </div>
      <CardAgingClockModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card DNA Aging Clock</button>
      )}
    </div>
  );
};

export default CardAgingClock;
