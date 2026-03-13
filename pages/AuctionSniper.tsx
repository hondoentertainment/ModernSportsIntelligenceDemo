// Phase 95: Auction Sniper Pro Page
// Route: /auction-sniper | Icon: Gavel
import React, { useState } from 'react';
import { Gavel } from 'lucide-react';
import AuctionSniperModal from '../components/AuctionSniperModal.tsx';

const AuctionSniper: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-lime-500/20">
          <Gavel size={24} className="text-lime-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Auction Sniper Pro &mdash; AI-Powered Bid Intelligence &amp; Shill Detection
          </h1>
          <p className="text-sm text-slate-400">
            Multi-platform auction tracking, bid pattern forensics, optimal timing algorithms, and cross-platform price arbitrage
          </p>
        </div>
      </div>
      <AuctionSniperModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-lime-600 hover:bg-lime-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Auction Sniper Pro
        </button>
      )}
    </div>
  );
};

export default AuctionSniper;
