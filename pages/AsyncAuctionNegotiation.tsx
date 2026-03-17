import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import AsyncAuctionNegotiationModal from '../components/AsyncAuctionNegotiationModal.tsx';

const AsyncAuctionNegotiation: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20"><MessageSquare size={24} className="text-indigo-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Async Auction Negotiation</h1>
          <p className="text-sm text-slate-400">Automated offer and counteroffer negotiation engine</p>
        </div>
      </div>
      <AsyncAuctionNegotiationModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Async Auction Negotiation</button>
      )}
    </div>
  );
};

export default AsyncAuctionNegotiation;
