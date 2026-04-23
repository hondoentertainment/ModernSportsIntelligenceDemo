// @ts-nocheck
import React, { useState } from 'react';
import { Box } from 'lucide-react';
import WaxCTScannerModal from '../components/WaxCTScannerModal.tsx';

const WaxCTScanner: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20"><Box size={24} className="text-amber-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sealed Wax CT Scanner</h1>
          <p className="text-sm text-slate-400">Scan sealed wax products for content analysis</p>
        </div>
      </div>
      <WaxCTScannerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Sealed Wax CT Scanner</button>
      )}
    </div>
  );
};

export default WaxCTScanner;
