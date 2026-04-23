// @ts-nocheck
import React, { useState } from 'react';
import { Hash } from 'lucide-react';
import EditionPrintRunModal from '../components/EditionPrintRunModal.tsx';

const EditionPrintRun: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sky-500/20"><Hash size={24} className="text-sky-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Edition Print Run Intelligence</h1>
          <p className="text-sm text-slate-400">Track and estimate print run sizes</p>
        </div>
      </div>
      <EditionPrintRunModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Edition Print Run Intelligence</button>
      )}
    </div>
  );
};

export default EditionPrintRun;
