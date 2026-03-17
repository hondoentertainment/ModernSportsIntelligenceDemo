import React, { useState } from 'react';
import { Hourglass } from 'lucide-react';
import CardAgingSimulatorModal from '../components/CardAgingSimulatorModal.tsx';

const CardAgingSimulator: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20"><Hourglass size={24} className="text-amber-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Aging Simulator</h1>
          <p className="text-sm text-slate-400">Project how cards degrade over time</p>
        </div>
      </div>
      <CardAgingSimulatorModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card Aging Simulator</button>
      )}
    </div>
  );
};

export default CardAgingSimulator;
