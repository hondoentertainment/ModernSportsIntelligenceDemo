import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import ProvenanceChainModal from '../components/ProvenanceChainModal.tsx';

const ProvenanceChain: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <Link2 size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Provenance Chain & Digital Twins</h1>
          <p className="text-sm text-slate-400">Blockchain-backed ownership history and authentication — no competitor offers this</p>
        </div>
      </div>
      <ProvenanceChainModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Provenance Chain
        </button>
      )}
    </div>
  );
};

export default ProvenanceChain;
