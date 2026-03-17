import React, { useState } from 'react';
import { Users } from 'lucide-react';
import PsychographicDemandModal from '../components/PsychographicDemandModal.tsx';

const PsychographicDemand: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20"><Users size={24} className="text-violet-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Psychographic Demand Modeler</h1>
          <p className="text-sm text-slate-400">Buyer demographic cohort modeling and demand prediction</p>
        </div>
      </div>
      <PsychographicDemandModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Psychographic Demand Modeler</button>
      )}
    </div>
  );
};

export default PsychographicDemand;
