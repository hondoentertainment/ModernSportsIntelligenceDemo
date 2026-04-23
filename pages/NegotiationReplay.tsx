// @ts-nocheck
import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import NegotiationReplayModal from '../components/NegotiationReplayModal.tsx';

const NegotiationReplay: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20"><PlayCircle size={24} className="text-orange-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Negotiation Replay Theater</h1>
          <p className="text-sm text-slate-400">Record, replay, and study negotiation sessions</p>
        </div>
      </div>
      <NegotiationReplayModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors">Open AI Negotiation Replay Theater</button>
      )}
    </div>
  );
};

export default NegotiationReplay;
