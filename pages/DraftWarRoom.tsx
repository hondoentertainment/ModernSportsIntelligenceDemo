// @ts-nocheck
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import DraftWarRoomModal from '../components/DraftWarRoomModal.tsx';

const DraftWarRoom: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-lime/20">
          <Users size={24} className="text-brand-lime" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Draft War Room &mdash; Multi-Sport Draft Intelligence &amp; Rookie Card Timing
          </h1>
          <p className="text-sm text-slate-400">
            Prospect rankings mapped to card values, draft-night price surge predictions, and buy/sell timing
          </p>
        </div>
      </div>
      <DraftWarRoomModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-lime/20 hover:bg-brand-lime/30 text-brand-lime rounded-lg text-sm font-semibold transition-colors border border-brand-lime/30"
        >
          Open Draft War Room
        </button>
      )}
    </div>
  );
};

export default DraftWarRoom;
