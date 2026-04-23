// @ts-nocheck
import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import CardDNAFingerprintModal from '../components/CardDNAFingerprintModal.tsx';

const CardDNAFingerprint: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20"><Fingerprint size={24} className="text-violet-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card DNA Fingerprint Scanner</h1>
          <p className="text-sm text-slate-400">Identify unique physical characteristics of each card</p>
        </div>
      </div>
      <CardDNAFingerprintModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card DNA Fingerprint Scanner</button>
      )}
    </div>
  );
};

export default CardDNAFingerprint;
