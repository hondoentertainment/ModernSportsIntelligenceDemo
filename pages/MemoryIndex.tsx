// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import MemoryIndexModal from '../components/MemoryIndexModal.tsx';

const MemoryIndex: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <Sparkles size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cross-Generational Memory Index</h1>
          <p className="text-sm text-slate-400">Quantify cultural staying power across demographics for long-term value prediction</p>
        </div>
      </div>
      <MemoryIndexModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Cross-Generational Memory Index
        </button>
      )}
    </div>
  );
};

export default MemoryIndex;
