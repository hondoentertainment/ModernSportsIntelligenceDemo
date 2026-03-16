import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import CenteringAnalyzerModal from '../components/CenteringAnalyzerModal.tsx';

const CenteringAnalyzer: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sky-500/20">
          <Crosshair size={24} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Centering Precision Analyzer</h1>
          <p className="text-sm text-slate-400">AI centering measurement with sub-grade impact prediction</p>
        </div>
      </div>
      <CenteringAnalyzerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Centering Precision Analyzer
        </button>
      )}
    </div>
  );
};

export default CenteringAnalyzer;
