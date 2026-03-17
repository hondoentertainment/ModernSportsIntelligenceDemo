import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import HobbyEntryRampModal from '../components/HobbyEntryRampModal.tsx';

const HobbyEntryRamp: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-lime-500/20"><GraduationCap size={24} className="text-lime-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Hobby Entry Ramp</h1>
          <p className="text-sm text-slate-400">Guided onboarding pathways for new collectors</p>
        </div>
      </div>
      <HobbyEntryRampModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-lime-600 hover:bg-lime-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Hobby Entry Ramp</button>
      )}
    </div>
  );
};

export default HobbyEntryRamp;
