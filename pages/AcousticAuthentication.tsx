// @ts-nocheck
import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import AcousticAuthenticationModal from '../components/AcousticAuthenticationModal.tsx';

const AcousticAuthentication: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20"><Volume2 size={24} className="text-cyan-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Acoustic Authentication Engine</h1>
          <p className="text-sm text-slate-400">Sound-based micro-tap resonance analysis for card authentication</p>
        </div>
      </div>
      <AcousticAuthenticationModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Acoustic Authentication Engine</button>
      )}
    </div>
  );
};

export default AcousticAuthentication;
