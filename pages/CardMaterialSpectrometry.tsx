// @ts-nocheck
import React, { useState } from 'react';
import { Microscope } from 'lucide-react';
import CardMaterialSpectrometryModal from '../components/CardMaterialSpectrometryModal.tsx';

const CardMaterialSpectrometry: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20"><Microscope size={24} className="text-indigo-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Material Spectrometry</h1>
          <p className="text-sm text-slate-400">Spectral analysis for detecting reprints and material variations</p>
        </div>
      </div>
      <CardMaterialSpectrometryModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card Material Spectrometry</button>
      )}
    </div>
  );
};

export default CardMaterialSpectrometry;
