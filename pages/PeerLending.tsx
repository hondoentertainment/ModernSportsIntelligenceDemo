// @ts-nocheck
import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import PeerLendingModal from '../components/PeerLendingModal.tsx';

const PeerLending: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-500/20"><ArrowLeftRight size={24} className="text-green-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Peer Lending Marketplace</h1>
          <p className="text-sm text-slate-400">Peer-to-peer card lending platform</p>
        </div>
      </div>
      <PeerLendingModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Peer Lending Marketplace</button>
      )}
    </div>
  );
};

export default PeerLending;
