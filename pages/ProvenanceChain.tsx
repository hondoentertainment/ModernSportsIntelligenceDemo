import React, { useState } from 'react';
import { Link2, AlertTriangle } from 'lucide-react';
import ProvenanceChainModal from '../components/ProvenanceChainModal.tsx';

const ProvenanceChain: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Link2 size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Provenance Chain & Digital Twins</h1>
            <p className="text-sm text-slate-400">Prototype registry and verification workflow rendered against simulated ownership data — no live chain is connected.</p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">
          Beta · Simulation only
        </span>
      </div>

      <div className="flex items-start gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-snug">
          Authenticity scores, ownership history, and verification results are <strong>generated from mock data</strong> for demonstration purposes.
          They do not reflect any real chain-of-custody record and must not be relied on when buying, selling, or authenticating a card.
        </p>
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
