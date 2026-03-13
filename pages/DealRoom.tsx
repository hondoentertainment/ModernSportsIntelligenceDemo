import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import DealRoomModal from '../components/DealRoomModal.tsx';

const DealRoom: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20">
          <MessageSquare size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Institutional Deal Room</h1>
          <p className="text-sm text-slate-400">Secure, Encrypted Negotiations for High-Value Cards</p>
        </div>
      </div>
      <DealRoomModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Deal Room
        </button>
      )}
    </div>
  );
};

export default DealRoom;
