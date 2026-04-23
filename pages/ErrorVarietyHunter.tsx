// @ts-nocheck
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ErrorVarietyHunterModal from '../components/ErrorVarietyHunterModal.tsx';

const ErrorVarietyHunter: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-pink-500/20"><Search size={24} className="text-pink-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Error & Variety Hunter</h1>
          <p className="text-sm text-slate-400">Identify and catalog card errors and varieties</p>
        </div>
      </div>
      <ErrorVarietyHunterModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Error & Variety Hunter</button>
      )}
    </div>
  );
};

export default ErrorVarietyHunter;
