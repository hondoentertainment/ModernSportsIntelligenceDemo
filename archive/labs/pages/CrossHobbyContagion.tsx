import React, { useState } from 'react';
import { Network } from 'lucide-react';
import CrossHobbyContagionModal from '../components/CrossHobbyContagionModal.tsx';

const CrossHobbyContagion: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20"><Network size={24} className="text-purple-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cross-Hobby Contagion Network</h1>
          <p className="text-sm text-slate-400">Track trend propagation between collectible hobbies</p>
        </div>
      </div>
      <CrossHobbyContagionModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Cross-Hobby Contagion Network</button>
      )}
    </div>
  );
};

export default CrossHobbyContagion;
