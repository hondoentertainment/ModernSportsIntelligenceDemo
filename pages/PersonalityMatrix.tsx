import React, { useState } from 'react';
import { Users } from 'lucide-react';
import PersonalityMatrixModal from '../components/PersonalityMatrixModal.tsx';

const PersonalityMatrix: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20"><Users size={24} className="text-purple-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collector Personality Matrix</h1>
          <p className="text-sm text-slate-400">Discover your collector personality profile</p>
        </div>
      </div>
      <PersonalityMatrixModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Collector Personality Matrix</button>
      )}
    </div>
  );
};

export default PersonalityMatrix;
