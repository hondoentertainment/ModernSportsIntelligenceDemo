// @ts-nocheck
import React, { useState } from 'react';
import { Tv } from 'lucide-react';
import LiveBreakRoomModal from '../components/LiveBreakRoomModal.tsx';

const LiveBreaks: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20">
          <Tv size={24} className="text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Break Room & Auction Intelligence</h1>
          <p className="text-sm text-slate-400">Live breaks, auction tracking, and AI snipe bots — no competitor offers this</p>
        </div>
      </div>
      <LiveBreakRoomModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Live Breaks & Auctions
        </button>
      )}
    </div>
  );
};

export default LiveBreaks;
