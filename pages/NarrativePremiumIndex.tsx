// @ts-nocheck
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import NarrativePremiumIndexModal from '../components/NarrativePremiumIndexModal.tsx';

const NarrativePremiumIndex: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-teal-500/20"><BookOpen size={24} className="text-teal-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Narrative Premium Index</h1>
          <p className="text-sm text-slate-400">Quantify the premium added by player storylines</p>
        </div>
      </div>
      <NarrativePremiumIndexModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Narrative Premium Index</button>
      )}
    </div>
  );
};

export default NarrativePremiumIndex;
