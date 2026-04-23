// @ts-nocheck
import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import SlabCaseForensicsModal from '../components/SlabCaseForensicsModal.tsx';

const SlabCaseForensics: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20"><ScanLine size={24} className="text-cyan-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Slab Case Forensics</h1>
          <p className="text-sm text-slate-400">Analyze and verify slab case authenticity</p>
        </div>
      </div>
      <SlabCaseForensicsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Slab Case Forensics</button>
      )}
    </div>
  );
};

export default SlabCaseForensics;
